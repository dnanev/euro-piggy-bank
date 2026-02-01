import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { LogOut, Moon, Sun, Globe } from 'lucide-react'
import { useAppStoreFirebase } from '../store/useAppStoreFirebase'

export const AppHeader: React.FC = () => {
  const { user, signOut } = useAuth()
  const { theme, setTheme, language, setLanguage, showBgn, setShowBgn } = useAppStoreFirebase()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const toggleLanguage = () => {
    setLanguage(language === 'bg' ? 'en' : 'bg')
  }

  const toggleCurrency = () => {
    setShowBgn(!showBgn)
  }

  const getUserInitials = () => {
    if (!user?.email) return 'U'
    return user.email.charAt(0).toUpperCase()
  }

  const getUserDisplayName = () => {
    if (user?.displayName) return user.displayName
    if (user?.email) return user.email
    return 'User'
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* App Title */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Euro Piggy Bank</h1>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-2">
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="h-9 px-3"
            title="Toggle language"
          >
            <Globe className="h-4 w-4 mr-1" />
            {language.toUpperCase()}
          </Button>

          {/* Currency Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCurrency}
            className="h-9 px-3"
            title="Toggle currency display"
          >
            {showBgn ? 'BGN' : 'EUR'}
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 p-0"
            title="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full"
                title="User menu"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.photoURL || ''} alt={getUserDisplayName()} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{getUserDisplayName()}</p>
                  {user?.email && (
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default AppHeader
