package model

import (
	"time"

	"gorm.io/gorm"
)

type UserRole string

const (
	RoleStudent  UserRole = "student"
	RoleMentor   UserRole = "mentor"
	RoleInvestor UserRole = "investor"
	RolePartner  UserRole = "partner"
	RoleAdmin    UserRole = "admin"
)

type User struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Username string   `gorm:"uniqueIndex;size:50;not null" json:"username"`
	Email    string   `gorm:"uniqueIndex;size:100;not null" json:"email"`
	Password string   `gorm:"size:255;not null" json:"-"`
	Nickname string   `gorm:"size:50" json:"nickname"`
	Avatar   string   `gorm:"size:255" json:"avatar"`
	Phone    string   `gorm:"size:20" json:"phone"`
	Role     UserRole `gorm:"type:varchar(20);not null;default:'student'" json:"role"`
	IsActive bool     `gorm:"default:true" json:"is_active"`
}

type TeamStatus string

const (
	TeamStatusPending  TeamStatus = "pending"
	TeamStatusApproved TeamStatus = "approved"
	TeamStatusRejected TeamStatus = "rejected"
)

type Team struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Name        string     `gorm:"size:100;not null" json:"name"`
	Description string     `gorm:"type:text" json:"description"`
	Logo        string     `gorm:"size:255" json:"logo"`
	Status      TeamStatus `gorm:"type:varchar(20);not null;default:'pending'" json:"status"`

	OwnerID uint   `gorm:"not null;index" json:"owner_id"`
	Owner   *User  `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
	Members []User `gorm:"many2many:team_members;" json:"members,omitempty"`
}

type ApplicationStatus string

const (
	AppStatusDraft     ApplicationStatus = "draft"
	AppStatusPending   ApplicationStatus = "pending"
	AppStatusApproved  ApplicationStatus = "approved"
	AppStatusRejected  ApplicationStatus = "rejected"
	AppStatusCancelled ApplicationStatus = "cancelled"
)

type StartupApplication struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Title        string            `gorm:"size:200;not null" json:"title"`
	Description  string            `gorm:"type:text" json:"description"`
	BusinessPlan string            `gorm:"type:text" json:"business_plan"`
	Status       ApplicationStatus `gorm:"type:varchar(20);not null;default:'draft'" json:"status"`

	UserID     uint       `gorm:"not null;index" json:"user_id"`
	User       *User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	ReviewNote string     `gorm:"type:text" json:"review_note"`
	ReviewedBy *uint      `json:"reviewed_by"`
	ReviewedAt *time.Time `json:"reviewed_at"`
}

type ProjectStatus string

const (
	ProjStatusDraft           ProjectStatus = "draft"
	ProjStatusPendingOnline   ProjectStatus = "pending_online"
	ProjStatusOnline          ProjectStatus = "online"
	ProjStatusRejectedOnline  ProjectStatus = "rejected_online"
	ProjStatusPendingOffline  ProjectStatus = "pending_offline"
	ProjStatusOffline         ProjectStatus = "offline"
	ProjStatusRejectedOffline ProjectStatus = "rejected_offline"
	ProjStatusInvalid         ProjectStatus = "invalid"
)

type Project struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Title       string        `gorm:"size:200;not null" json:"title"`
	Description string        `gorm:"type:text" json:"description"`
	Content     string        `gorm:"type:text" json:"content"`
	CoverImage  string        `gorm:"size:255" json:"cover_image"`
	Status      ProjectStatus `gorm:"type:varchar(30);not null;default:'draft'" json:"status"`
	IsPublic    bool          `gorm:"default:true" json:"is_public"`

	TeamID    uint   `gorm:"not null;index" json:"team_id"`
	Team      *Team  `gorm:"foreignKey:TeamID" json:"team,omitempty"`
	Tags      string `gorm:"size:500" json:"tags"`
	ViewCount uint   `gorm:"default:0" json:"view_count"`
}

type RecruitmentStatus string

const (
	RecruitStatusActive  RecruitmentStatus = "active"
	RecruitStatusSolved  RecruitmentStatus = "solved"
	RecruitStatusInvalid RecruitmentStatus = "invalid"
)

type Recruitment struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Title        string            `gorm:"size:200;not null" json:"title"`
	Description  string            `gorm:"type:text" json:"description"`
	Requirements string            `gorm:"type:text" json:"requirements"`
	Status       RecruitmentStatus `gorm:"type:varchar(20);not null;default:'active'" json:"status"`

	TeamID   uint       `gorm:"not null;index" json:"team_id"`
	Team     *Team      `gorm:"foreignKey:TeamID" json:"team,omitempty"`
	Position string     `gorm:"size:100" json:"position"`
	Salary   string     `gorm:"size:100" json:"salary"`
	Deadline *time.Time `json:"deadline"`
}

type ResponseStatus string

const (
	RespStatusPending  ResponseStatus = "pending"
	RespStatusAccepted ResponseStatus = "accepted"
	RespStatusRejected ResponseStatus = "rejected"
	RespStatusInvalid  ResponseStatus = "invalid"
)

type RecruitmentResponse struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	CoverLetter string         `gorm:"type:text" json:"cover_letter"`
	Resume      string         `gorm:"size:255" json:"resume"`
	Status      ResponseStatus `gorm:"type:varchar(20);not null;default:'pending'" json:"status"`

	RecruitmentID uint         `gorm:"not null;index" json:"recruitment_id"`
	Recruitment   *Recruitment `gorm:"foreignKey:RecruitmentID" json:"recruitment,omitempty"`
	UserID        uint         `gorm:"not null;index" json:"user_id"`
	User          *User        `gorm:"foreignKey:UserID" json:"user,omitempty"`
	ReviewNote    string       `gorm:"type:text" json:"review_note"`
}
