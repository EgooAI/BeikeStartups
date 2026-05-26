package main

import (
	"github.com/EgooAI/BeikeStartups/database"
	"github.com/EgooAI/BeikeStartups/router"
)

func main() {
	database.InitDatabase()

	r := router.SetupRouter()
	r.Run(":8080")
}
