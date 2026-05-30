package database

import (
	"fmt"
	"log"

	"github.com/EgooAI/BeikeStartups/config"
	"github.com/EgooAI/BeikeStartups/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDatabase(cfg *config.Config) {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Shanghai",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect database:", err)
	}

	err = DB.AutoMigrate(
		&model.User{},
		&model.Team{},
		&model.TeamMemberInvitation{},
		&model.TeamJoinRequest{},
		&model.StartupApplication{},
		&model.Project{},
		&model.Recruitment{},
		&model.RecruitmentResponse{},
		&model.ResourceOpportunity{},
		&model.ProjectFavorite{},
		&model.ProjectBPRequest{},
		&model.ProjectConnectionRequest{},
		&model.ProjectMentor{},
		&model.ProjectInvestor{},
		&model.ProjectPartner{},
		&model.Event{},
		&model.EventSignup{},
		&model.Banner{},
	)
	if err != nil {
		log.Fatal("failed to migrate database:", err)
	}

	fmt.Println("Database initialized successfully")
}
