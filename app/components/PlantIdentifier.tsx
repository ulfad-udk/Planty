'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'

interface PlantInfo {
  name: string;
  scientificName: string;
  family: string;
  description: string;
  nativeTo: string[];
  sunlight?: string;
  watering?: string;
  soil?: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
  stack?: string;
}

export default function PlantIdentifier() {
  const [image, setImage] = useState<string | null>(null)
  const [plantInfo, setPlantInfo] = useState<PlantInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ErrorResponse | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showCamera, setShowCamera] = useState(false)

  const handleImageCapture = async (file: File) => {
    setImage(URL.createObjectURL(file))
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const response = await fetch('/api/identify-plant', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (!response.ok) {
        throw data
      }
      setPlantInfo(data)
    } catch (error) {
      console.error('Error identifying plant:', error)
      setError(error as ErrorResponse)
    }
    setLoading(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageCapture(file)
    }
  }

  const startCamera = async () => {
    setShowCamera(true)
    if (videoRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        videoRef.current.srcObject = stream
      } catch (err) {
        console.error("Error accessing camera:", err)
        setError({ error: "Failed to access camera" })
      }
    }
  }

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)
      canvas.toBlob((blob) => {
        if (blob) {
          handleImageCapture(new File([blob], "captured_image.jpg", { type: "image/jpeg" }))
        }
      }, 'image/jpeg')
      setShowCamera(false)
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-bold text-center text-green-700 mb-4">Plant Identifier</h1>
      <p className="text-center text-gray-600 mb-6 text-sm md:text-base">Upload an image or take a photo of a plant to identify it and learn more about its characteristics.</p>
      
      <div className="mb-6 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-sm md:text-base"
        >
          Upload Image
        </button>
        <button
          onClick={startCamera}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-sm md:text-base"
        >
          Take Photo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {showCamera && (
        <div className="mb-6">
          <video ref={videoRef} autoPlay playsInline className="w-full max-w-lg mx-auto rounded-lg" />
          <button
            onClick={captureImage}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded block mx-auto text-sm md:text-base"
          >
            Capture
          </button>
        </div>
      )}

      {loading && <p className="text-center text-green-600 text-sm md:text-base">Identifying plant...</p>}
      
      {error && (
        <div className="text-center text-red-500 mb-6 text-sm md:text-base">
          <p>{error.error}</p>
          {error.details && <p>Details: {error.details}</p>}
          {error.stack && (
            <details>
              <summary>Error Stack</summary>
              <pre className="text-xs overflow-x-auto">{error.stack}</pre>
            </details>
          )}
        </div>
      )}

      {image && !showCamera && (
        <div className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-3">Captured Image</h2>
          <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden">
            <Image src={image} alt="Captured plant" layout="fill" objectFit="cover" className="rounded-lg" />
          </div>
        </div>
      )}

      {plantInfo && (
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-3 text-green-700">{plantInfo.name}</h2>
          <p className="text-gray-600 mb-4 text-sm md:text-base">{plantInfo.description}</p>
          
          <h3 className="text-lg md:text-xl font-semibold mb-3">Plant Information</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm md:text-base">
              <thead>
                <tr>
                  <th className="py-2 px-3 bg-green-100 font-semibold text-green-700 border-b">Characteristic</th>
                  <th className="py-2 px-3 bg-green-100 font-semibold text-green-700 border-b">Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-3 border-b">Scientific Name</td>
                  <td className="py-2 px-3 border-b">{plantInfo.scientificName}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border-b">Family</td>
                  <td className="py-2 px-3 border-b">{plantInfo.family}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border-b">Native To</td>
                  <td className="py-2 px-3 border-b">{plantInfo.nativeTo.join(', ')}</td>
                </tr>
                {plantInfo.sunlight && (
                  <tr>
                    <td className="py-2 px-3 border-b">Sunlight Needs</td>
                    <td className="py-2 px-3 border-b">{plantInfo.sunlight}</td>
                  </tr>
                )}
                {plantInfo.watering && (
                  <tr>
                    <td className="py-2 px-3 border-b">Watering Needs</td>
                    <td className="py-2 px-3 border-b">{plantInfo.watering}</td>
                  </tr>
                )}
                {plantInfo.soil && (
                  <tr>
                    <td className="py-2 px-3 border-b">Soil Type</td>
                    <td className="py-2 px-3 border-b">{plantInfo.soil}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
