// TODO: Upload Lambda (CDK ???)
// TODO: Hook up to API gateway (CDK ???)
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/bwmarrin/discordgo"
	"github.com/joho/godotenv"
)

const nasaApiUrl = "https://api.nasa.gov/planetary/apod"

var nasaApiKey = os.Getenv("NASA_API_KEY")

var discordApiToken = os.Getenv("DISCORD_API_TOKEN")
var discordApiChannel = os.Getenv("DISCORD_API_CHANNEL") // TODO: Pass this in the request.

type nasaResponse struct {
	Copyright   string `json:"copyright"`
	Date        string `json:"date"`
	Explanation string `json:"explanation"`
	Title       string `json:"title"`
	Hdurl       string `json:"hdurl"`
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

func HandleRequest(ctx context.Context, event *any) (*string, error) {
	log.Println(event)
	if event == nil {
		return nil, fmt.Errorf("received nil event")
	}

	sendNasaImageOfTheDay()

	successMsg := "Successfully sent message to bot channel"
	return &successMsg, nil
}

func loadEnvironment() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("WARNING could not load environment file")
	}
	nasaApiKey = os.Getenv("NASA_API_KEY")
	discordApiToken = os.Getenv("DISCORD_API_TOKEN")
	discordApiChannel = os.Getenv("DISCORD_API_CHANNEL") // TODO: Pass this in the request.
}

func main() {
	loadEnvironment()
	lambda.Start(HandleRequest)
}
