import { Pack } from '@/types'
import { PackCard } from './pack-card'

interface PacksSectionProps {
  packs: Pack[]
}

export function PacksSection({ packs }: PacksSectionProps) {
  if (packs.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Nos Packs Photos
        </h2>
        <p className="text-gray-600">
          Profitez de nos packs avantageux pour commander plusieurs photos à
          prix réduit
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {packs.map((pack) => (
          <PackCard key={pack.pack._id.toString()} pack={pack} />
        ))}
      </div>
    </div>
  )
}
