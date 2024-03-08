package backend

import (
	"context"
	"runtime"
)

// var dialogs = NewDialogManager()
// var paths = NewPathManager()

// App struct
type Backend struct {
	ctx     context.Context
	dialogs *Dialogs
	paths   *Paths
}

// NewApp creates a new App application struct
func CreateBackend() *Backend {
	created := &Backend{}
	created.dialogs = NewDialogManager()
	created.paths = NewPathManager()
	return created
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (d *Backend) SetContext(ctx context.Context) {
	d.ctx = ctx
	d.dialogs.SetContext(ctx)
	d.paths.SetContext(ctx)
}

func (d *Backend) GetModules() []interface{} {
	return []interface{}{d.dialogs, d.paths}
}

func (d *Backend) GetPlatform() string {
	return runtime.GOOS
}
