interface PageHeaderProps {
  title: string
  description?: string
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-3">
        {title}
      </h1>
      {description && <p className="text-lg text-gray-600">{description}</p>}
    </div>
  )
}

