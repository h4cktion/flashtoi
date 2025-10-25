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
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Nos Packs Photos
        </h2>
        <p className="text-gray-600">
          Profitez de nos packs avantageux pour commander plusieurs photos à prix réduit
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
