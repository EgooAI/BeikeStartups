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
	// 全局限制：multipart 表单最大 8MB，内存缓冲 5MB
	r.MaxMultipartMemory = 5 << 20
	r.Run(fmt.Sprintf(":%s", cfg.Port))
}
