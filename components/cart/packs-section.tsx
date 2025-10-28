import { Pack } from '@/types'
import { PackCard } from './pack-card'

interface PacksSectionProps {
  packs: Pack[]
}

export function PacksSection({ packs }: PacksSectionProps) {
  if (packs.length === 0) {
    return null
  }

  // Trier les packs par prix décroissant (du plus cher au moins cher)
  const sortedPacks = [...packs].sort((a, b) => b.pack.price - a.pack.price)

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Packs
        </h2>
        <p className="text-sm text-gray-600">
          Profitez de nos offres groupées
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {sortedPacks.map((pack) => (
          <PackCard key={pack.pack._id.toString()} pack={pack} />
        ))}
      </div>
    </div>
  )
}
