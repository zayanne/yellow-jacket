"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Calendar, MessageCircle } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

interface UserProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function UserProfileDialog({ open, onOpenChange }: UserProfileDialogProps) {
  const { identity, updateDisplayName } = useUser()
  const [displayName, setDisplayName] = useState(identity.displayName)

  const handleSave = () => {
    updateDisplayName(displayName)
    toast.success("Profile updated",{
      description: "Your display name has been saved.",
    })
    onOpenChange(false)
  }

  const handleCancel = () => {
    setDisplayName(identity.displayName)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">Your Profile</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Manage your anonymous identity and preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Identity Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Member since:</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(identity.createdAt), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">User ID:</span>
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{identity.id.slice(-8)}...</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Label htmlFor="display-name" className="text-sm font-medium">
              Display Name ho
            </Label>
            <Input
              id="display-name"
              placeholder="Enter your preferred name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              className="bg-input border-border"
            />
            <p className="text-xs text-muted-foreground">
              This name will be used for your posts and comments. Leave empty to remain "Anonymous".
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
