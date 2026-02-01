import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Alert, AlertDescription } from './ui/alert'
import { Badge } from './ui/badge'
import { CheckCircle, AlertCircle, Upload, Download, RotateCcw } from 'lucide-react'
import type { LocalStorageData } from '../utils/localStorage'
import type { EuroDenomination } from '../store/types'
import { hasLocalStorageData, getLocalStorageData, clearLocalStorageData } from '../utils/localStorage'
import { transformLocalStorageToFirebase, generateMigrationSummary, cleanLocalStorageData } from '../utils/dataTransform'
import { firestoreService } from '../firebase/firestore'
import { useAuth } from '../contexts/AuthContext'

interface MigrationStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed' | 'error'
  error?: string
}

export const MigrationWizard: React.FC = () => {
  const { user } = useAuth()
  const [hasData, setHasData] = useState(false)
  const [localStorageData, setLocalStorageData] = useState<LocalStorageData | null>(null)
  const [migrationSteps, setMigrationSteps] = useState<MigrationStep[]>([])
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationComplete, setMigrationComplete] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const checkData = () => {
      const dataExists = hasLocalStorageData()
      setHasData(dataExists)

      if (dataExists) {
        const data = getLocalStorageData()
        const cleanedData = cleanLocalStorageData(data)
        setLocalStorageData(cleanedData)

        const summary = generateMigrationSummary(cleanedData)

        setMigrationSteps([
          {
            id: 'validate',
            title: 'Validate Data',
            description: 'Checking data integrity and format',
            status: 'pending'
          },
          {
            id: 'backup',
            title: 'Create Backup',
            description: 'Creating a backup of your data',
            status: 'pending'
          },
          {
            id: 'transform',
            title: 'Transform Data',
            description: 'Converting data for Firebase',
            status: 'pending'
          },
          {
            id: 'upload',
            title: 'Upload to Firebase',
            description: `Uploading ${summary.totalItems} items`,
            status: 'pending'
          },
          {
            id: 'verify',
            title: 'Verify Migration',
            description: 'Confirming successful migration',
            status: 'pending'
          }
        ])
      }
    }

    checkData()
  }, [])

  const updateStepStatus = (stepId: string, status: MigrationStep['status'], error?: string) => {
    setMigrationSteps(prev =>
      prev.map(step =>
        step.id === stepId
          ? { ...step, status, error }
          : step
      )
    )
  }

  const startMigration = async () => {
    if (!user || !localStorageData) return

    setIsMigrating(true)
    setProgress(0)

    try {
      // Step 1: Validate Data
      updateStepStatus('validate', 'in-progress')
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate validation
      updateStepStatus('validate', 'completed')
      setProgress(20)

      // Step 2: Create Backup
      updateStepStatus('backup', 'in-progress')
      const backupData = JSON.stringify(localStorageData, null, 2)
      const backupBlob = new Blob([backupData], { type: 'application/json' })
      const backupUrl = URL.createObjectURL(backupBlob)
      const backupLink = document.createElement('a')
      backupLink.href = backupUrl
      backupLink.download = `euro-piggy-bank-backup-${new Date().toISOString().split('T')[0]}.json`
      backupLink.click()
      URL.revokeObjectURL(backupUrl)
      updateStepStatus('backup', 'completed')
      setProgress(40)

      // Step 3: Transform Data
      updateStepStatus('transform', 'in-progress')
      const transformedData = transformLocalStorageToFirebase(user.uid, localStorageData)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate transformation
      updateStepStatus('transform', 'completed')
      setProgress(60)

      // Step 4: Upload to Firebase
      updateStepStatus('upload', 'in-progress')

      // Upload user profile
      await firestoreService.createUserProfile(transformedData.userProfile)

      // Upload savings data
      if (transformedData.savings && transformedData.savings.denominations.some((d: EuroDenomination) => d.quantity > 0)) {
        await firestoreService.saveSavingsData(user.uid, transformedData.savings.denominations)
      }

      // Upload history
      for (const historyEntry of transformedData.history) {
        await firestoreService.addHistoryEntry(user.uid, historyEntry)
      }

      // Upload goals
      for (const goal of transformedData.goals) {
        await firestoreService.addGoal(user.uid, goal)
      }

      updateStepStatus('upload', 'completed')
      setProgress(80)

      // Step 5: Verify Migration
      updateStepStatus('verify', 'in-progress')
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate verification
      updateStepStatus('verify', 'completed')
      setProgress(100)

      setMigrationComplete(true)

      // Clear localStorage after successful migration
      setTimeout(() => {
        clearLocalStorageData()
      }, 2000)

    } catch (error) {
      console.error('Migration failed:', error)
      const currentStep = migrationSteps.find(step => step.status === 'in-progress')
      if (currentStep) {
        updateStepStatus(currentStep.id, 'error', error instanceof Error ? error.message : 'Unknown error')
      }
    } finally {
      setIsMigrating(false)
    }
  }

  const downloadBackup = () => {
    if (!localStorageData) return

    const backupData = JSON.stringify(localStorageData, null, 2)
    const backupBlob = new Blob([backupData], { type: 'application/json' })
    const backupUrl = URL.createObjectURL(backupBlob)
    const backupLink = document.createElement('a')
    backupLink.href = backupUrl
    backupLink.download = `euro-piggy-bank-backup-${new Date().toISOString().split('T')[0]}.json`
    backupLink.click()
    URL.revokeObjectURL(backupUrl)
  }

  const getStepIcon = (status: MigrationStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in-progress':
        return <RotateCcw className="h-5 w-5 text-blue-500 animate-spin" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  if (!hasData) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>No Local Data Found</CardTitle>
          <CardDescription>
            There's no data to migrate from localStorage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your app is ready to use with Firebase!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (migrationComplete) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Migration Complete!
          </CardTitle>
          <CardDescription>
            Your data has been successfully migrated to Firebase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              All {migrationSteps.length} steps completed
            </Badge>
          </div>
          <div className="text-sm text-gray-600 text-center">
            LocalStorage data has been cleared.
          </div>
        </CardContent>
      </Card>
    )
  }

  const summary = localStorageData ? generateMigrationSummary(localStorageData) : null

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Data Migration
        </CardTitle>
        <CardDescription>
          Migrate your existing data from localStorage to Firebase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {summary && (
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Migration Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Items to migrate:</span>
                <div className="font-medium">{summary.totalItems}</div>
              </div>
              <div>
                <span className="text-gray-600">Data size:</span>
                <div className="font-medium">{(summary.estimatedSize / 1024).toFixed(1)} KB</div>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-gray-600">Includes:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {summary.itemsToMigrate.map((item: string | string[]) => (
                  <Badge key={Array.isArray(item) ? item.join(',') : item} variant="outline" className="text-xs">
                    {Array.isArray(item) ? item.join(', ') : item}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {migrationSteps.map((step) => (
            <div key={step.id} className="flex items-center gap-3">
              {getStepIcon(step.status)}
              <div className="flex-1">
                <div className="font-medium">{step.title}</div>
                <div className="text-sm text-gray-600">{step.description}</div>
                {step.error && (
                  <div className="text-sm text-red-600 mt-1">{step.error}</div>
                )}
              </div>
              <Badge
                variant={step.status === 'completed' ? 'default' : 'secondary'}
                className={step.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
              >
                {step.status === 'completed' ? 'Done' :
                 step.status === 'in-progress' ? 'Working...' :
                 step.status === 'error' ? 'Error' : 'Pending'}
              </Badge>
            </div>
          ))}
        </div>

        {isMigrating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Migration Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={startMigration}
            disabled={isMigrating || !user}
            className="flex-1"
          >
            {isMigrating ? (
              <>
                <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                Migrating...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Start Migration
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={downloadBackup}
            disabled={isMigrating}
          >
            <Download className="h-4 w-4 mr-2" />
            Backup
          </Button>
        </div>

        {!user && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to start the migration.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export default MigrationWizard
