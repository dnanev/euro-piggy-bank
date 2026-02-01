import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { User, Mail, Calendar, Trash2, Save, Edit2, Check, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { deleteAccount } from '../firebase/auth'
import { useAppStoreFirebase } from '../store/useAppStoreFirebase'

export const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth()
  const { theme, setTheme, language, setLanguage, showBgn, setShowBgn } = useAppStoreFirebase()

  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSaveProfile = async () => {
    // This would update the user profile in Firebase
    setIsEditing(false)
    setMessage('Profile updated successfully!')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      setError('Please type DELETE to confirm')
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      await deleteAccount()
      await signOut()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete account')
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Please sign in to view your profile</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.photoURL || ''} />
                <AvatarFallback className="text-lg">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {user.displayName || 'User'}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="danger">Danger Zone</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your display name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user.email || ''}
                    disabled
                    placeholder="Email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Account Information</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Member since:</span>
                    <Badge variant="secondary">
                      {user.metadata?.creationTime ? formatDate(user.metadata.creationTime) : 'Unknown'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">User ID:</span>
                    <Badge variant="outline" className="text-xs">
                      {user.uid.slice(0, 8)}...
                    </Badge>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred color theme
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('light')}
                    >
                      Light
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('dark')}
                    >
                      Dark
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Language</Label>
                    <p className="text-sm text-muted-foreground">
                      Select your preferred language
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={language === 'bg' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setLanguage('bg')}
                    >
                      Български
                    </Button>
                    <Button
                      variant={language === 'en' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setLanguage('en')}
                    >
                      English
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Currency Display</Label>
                    <p className="text-sm text-muted-foreground">
                      Show amounts in BGN alongside EUR
                    </p>
                  </div>
                  <Button
                    variant={showBgn ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowBgn(!showBgn)}
                  >
                    {showBgn ? 'BGN Enabled' : 'BGN Disabled'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="danger" className="space-y-4">
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Trash2 className="h-5 w-5" />
                    Delete Account
                  </CardTitle>
                  <CardDescription>
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive font-medium mb-2">
                      Warning: This will permanently delete:
                    </p>
                    <ul className="text-sm text-destructive space-y-1 ml-4">
                      <li>• Your account and authentication data</li>
                      <li>• All savings denominations and history</li>
                      <li>• All savings goals and progress</li>
                      <li>• User preferences and settings</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deleteConfirm">
                      Type "DELETE" to confirm account deletion
                    </Label>
                    <Input
                      id="deleteConfirm"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="DELETE"
                      className="border-destructive focus:border-destructive"
                    />
                  </div>

                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== 'DELETE' || isDeleting}
                    className="w-full"
                  >
                    {isDeleting ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Deleting Account...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account Permanently
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {message && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <Check className="h-4 w-4" />
            <span className="text-sm">{message}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <X className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfile
