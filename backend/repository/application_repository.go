package repository

import (
	"errors"

	"github.com/EgooAI/BeikeStartups/database"
	"github.com/EgooAI/BeikeStartups/model"
	"gorm.io/gorm"
)

func HasApprovedApplicationByUserID(userID uint) (bool, error) {
	var application model.StartupApplication
	if err := database.DB.Where("user_id = ? AND status = ?", userID, model.AppStatusApproved).First(&application).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}
