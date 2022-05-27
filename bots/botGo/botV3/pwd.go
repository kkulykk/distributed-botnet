package main

import (
	"fmt"
	"log"
	"os/exec"
	"syscall"
	"time"
)

func main() {
	fmt.Println("Process manager")
	count := 0
	botCmd := exec.Command("bash", "-c", "go run ./botV3.go")
	if err := botCmd.Start(); err != nil {
		log.Fatal(err)
	}
	botCmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	fmt.Println("./botV3.go")

	for {
		fmt.Println(count)
		fmt.Println(botCmd.Process.Pid)
		count++
		time.Sleep(3 * time.Second)

		if count == 3 {
			// if err := botCmd.Process.Kill(); err != nil {
			// 	log.Fatal("failed to kill process: ", err)
			// }
			// syscall.Kill(-botCmd.Process.Pid, syscall.SIGKILL)

			// botCmd = exec.Command("bash", "-c", "go run ./botV4.go")
			// if err := botCmd.Start(); err != nil {
			// 	log.Fatal(err)
			// }

			// fmt.Println("./botV4.go")

			// pgid, err := syscall.Getpgid(botCmd.Process.Pid)
			// if err == nil {
			// 	syscall.Kill(-pgid, 15) // note the minus sign
			// }

			// botCmd.Wait()
		}

		// if count == 10 {
		// 	// if err := botCmd.Process.Kill(); err != nil {
		// 	// 	log.Fatal("failed to kill process: ", err)
		// 	// }

		// 	syscall.Kill(-botCmd.Process.Pid, syscall.SIGKILL)

		// 	botCmd = exec.Command("bash", "-c", "go run ./botV3.go")
		// 	if err := botCmd.Start(); err != nil {
		// 		log.Fatal(err)
		// 	}

		// 	fmt.Println("./botV3.go")
		// }
	}

}
