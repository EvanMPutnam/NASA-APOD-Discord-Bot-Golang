GOOS=linux GOARCH=amd64 go build -tags lambda.norpc -o bootstrap src/handler.go
zip lambda.zip bootstrap
rm bootstrap