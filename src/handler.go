package main

import (
	"context"
	"crypto/ed25519"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/bwmarrin/discordgo"
	"github.com/joho/godotenv"
)

const nasaApiUrl = "https://api.nasa.gov/planetary/apod"

var nasaApiKey = os.Getenv("NASA_API_KEY")

var discordApiToken = os.Getenv("DISCORD_API_TOKEN")
var discordApiChannel = os.Getenv("DISCORD_API_CHANNEL") // TODO: Pass this in the request.
var discordPublicKey = os.Getenv("DISCORD_PUBLIC_KEY")

type nasaResponse struct {
	Copyright   string `json:"copyright"`
	Date        string `json:"date"`
	Explanation string `json:"explanation"`
	Title       string `json:"title"`
	Hdurl       string `json:"hdurl"`
}

type discordRequest struct {
	Type int64 `json:"type"`
}

func getNasaData() nasaResponse {
	nasaResp := &nasaResponse{}
	nasaUrl := nasaApiUrl + "?api_key=" + nasaApiKey
	r, err := http.Get(nasaUrl)
	if err != nil {
		log.Fatal(err)
	}
	defer r.Body.Close()

	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Fatal(err)
	}

	err = json.Unmarshal(body, &nasaResp)
	if err != nil {
		log.Fatal(err)
	}
	return *nasaResp
}

func sendNasaImageOfTheDay() {
	nasaData := getNasaData()

	discord, err := discordgo.New(discordApiToken)
	if err != nil {
		log.Fatal(err.Error())
	}

	msg, err := discord.ChannelMessageSendComplex(discordApiChannel,
		&discordgo.MessageSend{
			Embeds: []*discordgo.MessageEmbed{
				{URL: nasaData.Hdurl, Title: nasaData.Title, Description: nasaData.Explanation,
					Type: discordgo.EmbedTypeImage, Image: &discordgo.MessageEmbedImage{URL: nasaData.Hdurl}},
			},
		})
	if err != nil {
		log.Fatal(err.Error())
	}

	log.Printf("Message ID: %s\n", msg.ID)
}

func validateSignature(event *events.APIGatewayProxyRequest) bool {
	sig := event.Headers["x-signature-ed25519"]
	timeStamp := event.Headers["x-signature-timestamp"]
	body := event.Body
	bodyBytes := []byte(timeStamp + body)
	log.Println(sig, timeStamp, body)
	sigBytes, err := hex.DecodeString(sig)
	if err != nil {
		return false
	}
	publicKey, err := hex.DecodeString(discordPublicKey)
	if err != nil {
		return false
	}
	trusted := ed25519.Verify(publicKey, bodyBytes, sigBytes)
	return trusted
}

func loadEnvironment() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("WARNING could not load environment file")
	}
	nasaApiKey = os.Getenv("NASA_API_KEY")
	discordApiToken = os.Getenv("DISCORD_API_TOKEN")
	discordApiChannel = os.Getenv("DISCORD_API_CHANNEL") // TODO: Pass this in the request.
	discordPublicKey = os.Getenv("DISCORD_PUBLIC_KEY")
}

func HandleRequest(ctx context.Context, event *events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	log.Println(event)
	if event == nil {
		return nil, fmt.Errorf("received nil event")
	}

	if !validateSignature(event) {
		return nil, fmt.Errorf("forbidden")
	}

	successMsg := "Successfully sent message to bot channel"

	discordReq := &discordRequest{}
	err := json.Unmarshal([]byte(event.Body), &discordReq)

	if err != nil {
		return nil, fmt.Errorf("no type present in request")
	}

	// Ping type for bot registration
	if discordReq.Type == 1 {
		return &events.APIGatewayProxyResponse{
			StatusCode: 200,
			Body:       `{ "type": 1 }`,
		}, nil
	} else {
		sendNasaImageOfTheDay()
	}

	sendNasaImageOfTheDay()
	return &events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       successMsg,
	}, nil
}

func main() {
	loadEnvironment()
	lambda.Start(HandleRequest)
}
