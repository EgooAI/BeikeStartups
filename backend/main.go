package main

import (
	"fmt"

	"github.com/EgooAI/BeikeStartups/config"
	"github.com/EgooAI/BeikeStartups/database"
	"github.com/EgooAI/BeikeStartups/router"
)

func main() {
	cfg := config.Load()
	database.InitDatabase(cfg)

	r := router.SetupRouter()
	r.Run(fmt.Sprintf(":%s", cfg.Port))
}
