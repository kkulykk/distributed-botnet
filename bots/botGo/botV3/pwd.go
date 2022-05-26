package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

var fileName = getCurrentFileName()

func main() {
	// out, err := exec.Command("./run.sh").Output()
	// if err != nil {
	// 	fmt.Printf("%s", err)
	// }
	// fmt.Println("Command Successfully Executed")
	// output := string(out[:])
	// fmt.Println(output)
	for {
		fmt.Println("I am running")
		time.Sleep(3 * time.Second)
	}
}

// fmt.Println(fileName)
// DownloadFile(fileName+".go", "https://acsprojectfiles.s3.amazonaws.com/botV3_0.go")

func getCurrentFileName() string {
	pwd, err := os.Getwd()
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	pathArray := strings.Split(pwd, "/")
	return pathArray[len(pathArray)-1]
}

// DownloadFile will download a url to a local file. It's efficient because it will
// write as it downloads and not load the whole file into memory.
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
