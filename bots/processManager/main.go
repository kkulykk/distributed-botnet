package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/exec"
	"time"
)

type BotVersionInfo struct {
	BotVersionName string
	BotFileUrl     string
}

const serverUrl = "http://localhost:5000"

func main() {
	fmt.Println("-- Process manager --\n")
	botVersionInfo := GetBotVersionInfo()
	currentBotName := botVersionInfo.BotVersionName

	fmt.Println("Downloading initial version of the bot...\n")
	DownloadFile(currentBotName+".go", botVersionInfo.BotFileUrl)

	fmt.Println("Compiling  initial version of the bot...\n")
	downloadFile := exec.Command("bash", "-c", "go build -o ./bin/"+currentBotName+" "+currentBotName+".go")
	_ = downloadFile.Start()

	downloadFile.Wait()

	fmt.Println("Initial version of the bot has successfully started\n")

	cmd := exec.Command("bash", "-c", "./bin/"+currentBotName)
	_ = cmd.Start()

	for {
		fmt.Println("Current bot version -> " + currentBotName)
		time.Sleep(5 * time.Second)
		newBotVersionInfo := GetBotVersionInfo()

		if newBotVersionInfo.BotVersionName != currentBotName {
			fmt.Println("\n!! Retrieving new version of the bot...\n")
			DownloadFile(newBotVersionInfo.BotVersionName+".go", newBotVersionInfo.BotFileUrl)

			fmt.Println("!! Compiling new version of the bot ...\n")
			newDownloadFile := exec.Command("bash", "-c", "go build -o ./bin/"+newBotVersionInfo.BotVersionName+" "+newBotVersionInfo.BotVersionName+".go")

			_ = newDownloadFile.Start()
			newDownloadFile.Wait()

			if err := cmd.Process.Kill(); err != nil {
				log.Fatal("failed to kill process: ", err)
			}

			fmt.Println("!! New version of the bot has successfully started\n")
			cmd = exec.Command("bash", "-c", "./bin/"+newBotVersionInfo.BotVersionName)
			_ = cmd.Start()

			currentBotName = newBotVersionInfo.BotVersionName
		}
	}
}

func GetBotVersionInfo() *BotVersionInfo {
	const getBotVersionInfoEndpoint = "/getBotVersionInfo"
	response, err := http.Get(serverUrl + getBotVersionInfoEndpoint)

	if err != nil {
		log.Fatal(err)
		return &BotVersionInfo{
			BotVersionName: "",
			BotFileUrl:     "",
		}
	}

	target, _ := ioutil.ReadAll(response.Body)
	response.Body.Close()

	var botVersionInfo BotVersionInfo
	json.Unmarshal(target, &botVersionInfo)

	return &botVersionInfo
}

func DownloadFile(filepath string, url string) error {

	// Get the data
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	// Create the file
	out, err := os.Create(filepath)
	if err != nil {
		return err
	}
	defer out.Close()

	// Write the body to file
	_, err = io.Copy(out, resp.Body)
	return err
}
