'use client'

import { useCartStore } from '@/lib/stores/cart-store'
import { Photo } from '@/types'
import { useState } from 'react'

interface AddPhotoToCartButtonProps {
  photo: Photo
  studentId: string
  studentName: string
  student_id: string
  classId: string
}

export function AddPhotoToCartButton({ photo, studentId, studentName, student_id, classId }: AddPhotoToCartButtonProps) {
  const addToCart = useCartStore((state) => state.addToCart)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    setIsAdding(true)
    addToCart({
      photoUrl: photo.cloudFrontUrl,
      format: photo.planche,
      plancheName: photo.planche,
      unitPrice: photo.price,
      studentId,
      studentName,
      student_id,
      classId,
    })
    setTimeout(() => setIsAdding(false), 1000)
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`px-8 py-3 rounded-lg font-semibold transition-colors text-white ${
        isAdding
          ? 'bg-green-500'
          : 'bg-[#192F84] hover:bg-[#1a3699]'
      }`}
    >
      {isAdding ? '✓ Ajouté' : 'Ajouter au panier'}
    </button>
  )
}
