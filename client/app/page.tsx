'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from 'next/image'

export default function NeuralStyleTransfer() {
  const [contentImage, setContentImage] = useState<string | null>(null)
  const [styleImage, setStyleImage] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const contentInputRef = useRef<HTMLInputElement>(null)
  const styleInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, setImage: (value: string | null) => void) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleStyleTransfer = async () => {
    if (!contentInputRef.current?.files?.[0] || !styleInputRef.current?.files?.[0]) {
      alert('Please upload both content and style images')
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('content_image', contentInputRef.current.files[0])
      formData.append('style_image', styleInputRef.current.files[0])

      const response = await fetch('http://127.0.0.1:5000/nst', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error");
      }

      const blob = await response.blob()
      const imageUrl = URL.createObjectURL(blob)
      setResultImage(imageUrl)
    } catch (error) {
      alert(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Neural Style Transfer</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-[3px] border-white/15">
          <CardHeader>
            <CardTitle>Content Image</CardTitle>
          </CardHeader>
          <CardContent>
            {contentImage && (
              <Image src={contentImage} alt="Content" width={300} height={300} className="w-full h-auto" />
            )}
          </CardContent>
          <CardFooter>
            <Input 
              type="file" 
              onChange={(e) => handleImageUpload(e, setContentImage)} 
              accept="image/*"
              className="border-white/10 rounded-[3px]"
              ref={contentInputRef}
            />
          </CardFooter>
        </Card>
        <Card className="rounded-[3px] border-white/15">
          <CardHeader>
            <CardTitle>Style Image</CardTitle>
          </CardHeader>
          <CardContent>
            {styleImage && (
              <Image src={styleImage} alt="Style" width={300} height={300} className="w-full h-auto" />
            )}
          </CardContent>
          <CardFooter>
            <Input 
              type="file" 
              onChange={(e) => handleImageUpload(e, setStyleImage)} 
              accept="image/*"
              className="border-white/10 rounded-[3px]"
              ref={styleInputRef}
            />
          </CardFooter>
        </Card>
        <Card className="rounded-[3px] border-white/15">
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            {resultImage && (
              <Image src={resultImage} alt="Result" width={300} height={300} className="w-full h-auto" />
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleStyleTransfer} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Apply Style Transfer'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

