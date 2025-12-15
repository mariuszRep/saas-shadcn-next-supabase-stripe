'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Folder, Plus, ArrowRight, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createWorkspace, updateWorkspace, deleteWorkspace, getOrganizationWorkspaces } from '@/features/workspaces/workspace-actions'
import type { Workspace } from '@/types/database'

interface WorkspaceManagerProps {
  organizationId: string
  organizationName: string
}

interface WorkspaceCardProps {
  variant: 'create' | 'default'
  workspace?: Workspace
  organizationId?: string
  onCreate?: () => void
  onEdit?: (workspace: Workspace) => void
  onDelete?: (workspace: Workspace) => void
}

function WorkspaceCard({ variant, workspace, organizationId, onCreate, onEdit, onDelete }: WorkspaceCardProps) {
  const router = useRouter()

  const handleDoubleClick = () => {
    if (variant === 'default' && workspace && organizationId) {
      router.push(`/organizations/${organizationId}/workspaces/${workspace.id}`)
    }
  }

  const handleEnter = () => {
    if (variant === 'default' && workspace && organizationId) {
      router.push(`/organizations/${organizationId}/workspaces/${workspace.id}`)
    }
  }

  if (variant === 'create') {
    return (
      <Card
        className="border-2 border-dashed hover:border-primary cursor-pointer transition-colors"
        onClick={onCreate}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 px-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-medium text-center">Create Workspace</p>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Add a new workspace
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!workspace) return null

  return (
    <Card
      className="hover:border-primary cursor-pointer transition-colors flex flex-col"
      onDoubleClick={handleDoubleClick}
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Folder className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">{workspace.name}</CardTitle>
            <CardDescription>Double-click to enter workspace</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                onEdit?.(workspace)
              }}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete?.(workspace)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground">
          Created {new Date(workspace.created_at).toLocaleDateString()}
        </p>
      </CardContent>
      <CardFooter className="pt-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation()
            handleEnter()
          }}
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          Enter
        </Button>
      </CardFooter>
    </Card>
  )
}

export function WorkspaceManager({ organizationId, organizationName }: WorkspaceManagerProps) {
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingWorkspace, setEditingWorkspace] = React.useState<Workspace | null>(null)
  const [deleteConfirmWorkspace, setDeleteConfirmWorkspace] = React.useState<Workspace | null>(null)
  const [workspaceName, setWorkspaceName] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  const loadWorkspaces = React.useCallback(async () => {
    setLoading(true)
    const result = await getOrganizationWorkspaces(organizationId)
    setLoading(false)

    if (result.success && result.workspaces) {
      setWorkspaces(result.workspaces)
    } else {
      toast.error(result.error || 'Failed to load workspaces')
    }
  }, [organizationId])

  React.useEffect(() => {
    loadWorkspaces()
  }, [loadWorkspaces])

  const handleOpenDialog = (workspace?: Workspace) => {
    if (workspace) {
      setEditingWorkspace(workspace)
      setWorkspaceName(workspace.name)
    } else {
      setEditingWorkspace(null)
      setWorkspaceName('')
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingWorkspace(null)
    setWorkspaceName('')
  }

  const handleSubmit = async () => {
    if (!workspaceName.trim()) {
      toast.error('Workspace name is required')
      return
    }

    setSubmitting(true)

    if (editingWorkspace) {
      const result = await updateWorkspace(editingWorkspace.id, workspaceName)
      setSubmitting(false)

      if (result.success) {
        toast.success('Workspace updated successfully')
        handleCloseDialog()
        loadWorkspaces()
      } else {
        toast.error(result.error || 'Failed to update workspace')
      }
    } else {
      const result = await createWorkspace(organizationId, workspaceName)
      setSubmitting(false)

      if (result.success) {
        toast.success('Workspace created successfully')
        handleCloseDialog()
        loadWorkspaces()
      } else {
        toast.error(result.error || 'Failed to create workspace')
      }
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirmWorkspace) return

    setSubmitting(true)
    const result = await deleteWorkspace(deleteConfirmWorkspace.id)
    setSubmitting(false)

    if (result.success) {
      toast.success('Workspace deleted successfully')
      setDeleteConfirmWorkspace(null)
      loadWorkspaces()
    } else {
      toast.error(result.error || 'Failed to delete workspace')
    }
  }

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">Loading workspaces...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <WorkspaceCard
            variant="create"
            onCreate={() => handleOpenDialog()}
          />
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              variant="default"
              workspace={workspace}
              organizationId={organizationId}
              onEdit={handleOpenDialog}
              onDelete={setDeleteConfirmWorkspace}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingWorkspace ? 'Edit Workspace' : 'Create New Workspace'}
            </DialogTitle>
            <DialogDescription>
              {editingWorkspace
                ? 'Update the workspace name below.'
                : 'Enter a name for your new workspace.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Enter workspace name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {editingWorkspace ? 'Save Changes' : 'Create Workspace'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirmWorkspace}
        onOpenChange={() => setDeleteConfirmWorkspace(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the workspace "{deleteConfirmWorkspace?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={submitting}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
