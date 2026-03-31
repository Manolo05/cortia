'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from 'lucide-react'

interface UploadFile {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

interface UploadZoneProps {
  dossierId: string
  onUploadComplete?: () => void
  accept?: string[]
  maxSize?: number
}

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function UploadZone({ dossierId, onUploadComplete }: UploadZoneProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending',
    }))
    setFiles(prev => [...prev, ...newFiles])

    if (rejectedFiles.length > 0) {
      console.warn('Fichiers rejetés:', rejectedFiles)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (files.length === 0 || isUploading) return
    setIsUploading(true)

    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'pending') continue

      setFiles(prev => prev.map((f, idx) =>
        idx === i ? { ...f, status: 'uploading', progress: 0 } : f
      ))

      try {
        const formData = new FormData()
        formData.append('file', files[i].file)
        formData.append('dossier_id', dossierId)

        const response = await fetch('/api/documents', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Erreur upload')
        }

        setFiles(prev => prev.map((f, idx) =>
          idx === i ? { ...f, status: 'success', progress: 100 } : f
        ))
      } catch (error) {
        setFiles(prev => prev.map((f, idx) =>
          idx === i ? {
            ...f,
            status: 'error',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
          } : f
        ))
      }
    }

    setIsUploading(false)
    if (onUploadComplete) onUploadComplete()
  }

  const pendingFiles = files.filter(f => f.status === 'pending')
  const completedFiles = files.filter(f => f.status === 'success')
  const errorFiles = files.filter(f => f.status === 'error')

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className={`p-3 rounded-full ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <Upload className={`h-6 w-6 ${isDragActive ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
          {isDragActive ? (
            <p className="text-blue-600 font-medium">Déposez vos fichiers ici</p>
          ) : (
            <>
              <div>
                <p className="font-medium text-gray-800">
                  Glissez-déposez vos documents
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  ou <span className="text-blue-600">parcourez</span> vos fichiers
                </p>
              </div>
              <p className="text-xs text-gray-400">
                PDF, Word, JPEG, PNG — Max. 10 MB par fichier
              </p>
            </>
          )}
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uploadFile, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-shrink-0">
                {uploadFile.status === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : uploadFile.status === 'error' ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <FileText className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {uploadFile.file.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-gray-500">
                    {formatFileSize(uploadFile.file.size)}
                  </p>
                  {uploadFile.status === 'error' && (
                    <p className="text-xs text-red-500">— {uploadFile.error}</p>
                  )}
                  {uploadFile.status === 'success' && (
                    <p className="text-xs text-green-600">— Envoyé</p>
                  )}
                </div>
                {uploadFile.status === 'uploading' && (
                  <div className="mt-1.5 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${uploadFile.progress}%` }}
                    />
                  </div>
                )}
              </div>
              {uploadFile.status === 'pending' && (
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {pendingFiles.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {pendingFiles.length} fichier{pendingFiles.length > 1 ? 's' : ''} prêt{pendingFiles.length > 1 ? 's' : ''} à envoyer
          </p>
          <button
            onClick={uploadFiles}
            disabled={isUploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Envoyer {pendingFiles.length} fichier{pendingFiles.length > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}

      {/* Stats */}
      {(completedFiles.length > 0 || errorFiles.length > 0) && pendingFiles.length === 0 && !isUploading && (
        <div className="flex items-center gap-4 text-sm">
          {completedFiles.length > 0 && (
            <span className="text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              {completedFiles.length} envoyé{completedFiles.length > 1 ? 's' : ''}
            </span>
          )}
          {errorFiles.length > 0 && (
            <span className="text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errorFiles.length} erreur{errorFiles.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
