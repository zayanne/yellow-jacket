"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useUser } from "@/contexts/user-context"

interface EditNameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditNameDialog({ open, onOpenChange }: EditNameDialogProps) {
  const { identity, updateDisplayName } = useUser()
  const [name, setName] = useState(identity.displayName || "")

  const handleSave = () => {
    updateDisplayName(name)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Display Name</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose how you want to appear in the chat. Leave blank to stay anonymous.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-sm font-medium text-foreground">
              Display name
            </Label>
            <Input
              id="displayName"
              placeholder="Enter your display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-input/50 border-border/50 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent/50"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary shadow-[var(--shadow-send)]"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}