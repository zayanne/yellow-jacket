"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Hash, Lock, Settings } from "lucide-react"
import { toast } from "sonner"

export default function BlipRooms() {
  const [rooms] = useState([
    {
      id: "general",
      name: "General",
      description: "Main chat room for everyone",
      members: "1/20",
      isActive: true,
      isPrivate: false,
    },
  ])


  const handleCreateRoom = () => {
    toast("Coming Soon 🚀",{
      description: "Room creation feature will be available soon.",
    })
  }

  const handleRoomSettings = () => {
    toast("Coming Soon ⚙️", {
      description: "Room settings will be available soon.",
    })
  }

  return (
    <div className="min-h-screen bg-background">
    

      {/* Main Content */}
      <div className="container mx-auto px-6 py-10">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Available Rooms</h2>
            <p className="text-muted-foreground">
              Choose a room to start chatting
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRoomSettings}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
            <Button
              onClick={handleCreateRoom}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Room
            </Button>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Link key={room.id} href={`/blip/${room.id}`}>
              <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer bg-black rounded-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-yellow-500">
                      {room.isPrivate ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <Hash className="w-4 h-4" />
                      )}
                      {room.name}
                    </CardTitle>
                    {room.isActive && (
                      <Badge variant="secondary">Live</Badge>
                    )}
                  </div>
                  <CardDescription>{room.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{room.members} members</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Join →
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-14">
          <h3 className="text-lg font-medium mb-4">Coming Soon</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Tech Talk",
                description: "Discuss the latest in technology",
                icon: "💻",
              },
              {
                name: "Random",
                description: "Chat about anything and everything",
                icon: "🎲",
              },
              {
                name: "Gaming",
                description: "For all gaming enthusiasts",
                icon: "🎮",
              },
            ].map((room, i) => (
              <Card
                key={i}
                className="opacity-60 bg-muted/50 cursor-not-allowed"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <span>{room.icon}</span>
                    {room.name}
                  </CardTitle>
                  <CardDescription>{room.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">0 members</span>
                  </div>
                  <Badge variant="outline">Soon</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
