package handler

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/EgooAI/BeikeStartups/response"
	"github.com/gin-gonic/gin"
)

func UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		response.BadRequest(c, "未找到上传文件: "+err.Error())
		return
	}

	// ensure uploads dir exists
	_ = os.MkdirAll("uploads", 0755)

	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	savePath := filepath.Join("uploads", filename)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		response.InternalError(c, "保存文件失败")
		return
	}

	// return accessible URL
	url := fmt.Sprintf("%s/uploads/%s", getBaseURL(c), filename)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": gin.H{"url": url}})
}

func getBaseURL(c *gin.Context) string {
	scheme := "http"
	if c.Request.TLS != nil {
		scheme = "https"
	}
	return fmt.Sprintf("%s://%s", scheme, c.Request.Host)
}
