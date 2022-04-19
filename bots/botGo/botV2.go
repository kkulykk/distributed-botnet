package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
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
	const serverURL = "http://localhost:3000"
	StartBot(serverURL)
}

func SendRequests(target string, times int) *ResultsObject {

	var statusCodes []int

	for i := 0; i < times; i++ {
		response, err := http.Get(target)
		if err != nil {
			fmt.Println("Target GET request error.")
			panic(err)
		}
		responseCode := response.StatusCode
		fmt.Println(responseCode)
		statusCodes = append(statusCodes, responseCode)
		defer response.Body.Close()
	}

	return &ResultsObject{
		Target:      target,
		StatusCodes: statusCodes,
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

	targetObject := GetTargetInfo(serverUrl)

	if targetObject.Status && (targetObject.TargetUrl != "") {
		var RequestInfo *ResultsObject = SendRequests(targetObject.TargetUrl,
			targetObject.RequestNum)
		SendBotStats(serverUrl, *RequestInfo)
	}

	if !targetObject.Status {
		fmt.Println("Server status is set to false.")
	}

	if targetObject.TargetUrl == "" {
		fmt.Println("No target link specified.")
	}

}
