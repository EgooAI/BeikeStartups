package handler

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/EgooAI/BeikeStartups/model"
	"github.com/EgooAI/BeikeStartups/response"
	"github.com/gin-gonic/gin"
)

const (
	// 最大文件大小：5MB
	maxFileSize int64 = 5 << 20
	// 每个用户每天最多上传次数
	maxDailyUploads = 20
)

// 允许的文件扩展名白名单
var allowedExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".gif":  true,
	".webp": true,
	".pdf":  true,
	".doc":  true,
	".docx": true,
}

// 允许的 MIME 类型白名单
var allowedMimeTypes = map[string]bool{
	"image/jpeg":         true,
	"image/png":          true,
	"image/gif":          true,
	"image/webp":         true,
	"application/pdf":    true,
	"application/msword": true,
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
}

// 用户每日上传计数器
type uploadCounter struct {
	mu     sync.Mutex
	counts map[uint]int // 用户ID -> 当日上传次数
	date   string       // 当前日期，用于每日重置
}

var dailyCounter = &uploadCounter{
	counts: make(map[uint]int),
	date:   time.Now().Format("2006-01-02"),
}

// checkQuota 检查并增加用户当日的上传计数，返回是否超过配额
func (uc *uploadCounter) checkQuota(userID uint) bool {
	uc.mu.Lock()
	defer uc.mu.Unlock()

	today := time.Now().Format("2006-01-02")
	if today != uc.date {
		// 日期变更，重置计数器
		uc.counts = make(map[uint]int)
		uc.date = today
	}

	if uc.counts[userID] >= maxDailyUploads {
		return false // 超过配额
	}
	uc.counts[userID]++
	return true
}

func UploadFile(c *gin.Context) {
	// 鉴权：获取当前用户
	userValue, _ := c.Get("user")
	user, ok := userValue.(*model.User)
	if !ok || user == nil {
		response.Unauthorized(c, "需要登录")
		return
	}

	// 检查每日上传配额
	if !dailyCounter.checkQuota(user.ID) {
		response.BadRequest(c, fmt.Sprintf("每日上传次数已达上限（%d次）", maxDailyUploads))
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		response.BadRequest(c, "未找到上传文件: "+err.Error())
		return
	}

	// 检查文件大小
	if file.Size > maxFileSize {
		response.BadRequest(c, fmt.Sprintf("文件大小超过限制（最大 %dMB）", maxFileSize/(1<<20)))
		return
	}

	// 检查文件扩展名
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !allowedExtensions[ext] {
		response.BadRequest(c, "不支持的文件类型，仅允许图片(jpg/png/gif/webp)和文档(pdf/doc/docx)")
		return
	}

	// 检查 MIME 类型（双重验证）
	if file.Header != nil {
		contentType := file.Header.Get("Content-Type")
		if contentType != "" && !allowedMimeTypes[contentType] {
			response.BadRequest(c, "不支持的文件MIME类型")
			return
		}
	}

	// 确保上传目录存在
	_ = os.MkdirAll("uploads", 0755)

	// 使用时间戳生成安全文件名，避免路径遍历
	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	savePath := filepath.Join("uploads", filename)

	// 额外安全检查：确保保存路径在 uploads 目录内
	absSavePath, _ := filepath.Abs(savePath)
	absUploadsDir, _ := filepath.Abs("uploads")
	if !strings.HasPrefix(absSavePath, absUploadsDir+string(filepath.Separator)) {
		response.BadRequest(c, "非法的文件路径")
		return
	}

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		response.InternalError(c, "保存文件失败")
		return
	}

	// 返回可访问的 URL
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
