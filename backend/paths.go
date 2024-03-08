package backend

import (
	"context"

	"installer/backend/utils"
)

// App struct
type Paths struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewPathManager() *Paths {
	return &Paths{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (d *Paths) SetContext(ctx context.Context) {
	d.ctx = ctx
}

func (d *Paths) GetDiscordPath(channel string) string {
	return utils.DiscordPath(channel)
}
