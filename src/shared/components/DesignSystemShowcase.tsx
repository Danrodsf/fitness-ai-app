import { Button, Card, Badge, Input } from '@/shared/components/ui'
import { ds } from '@/shared/utils/designSystem'
import { Star, Heart, Zap, Sparkles } from 'lucide-react'

// Componente para demostrar el design system refinado
export const DesignSystemShowcase = () => {
  return (
    <div className={ds.layout.container}>
      <div className={ds.layout.section}>
        
        {/* Typography Scale */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Typography System
          </h2>
          <div className="space-y-4">
            <div className="text-6xl font-bold">Heading 1 - 60px</div>
            <div className="text-5xl font-bold">Heading 2 - 48px</div>
            <div className="text-4xl font-bold">Heading 3 - 36px</div>
            <div className="text-3xl font-semibold">Heading 4 - 30px</div>
            <div className="text-2xl font-semibold">Heading 5 - 24px</div>
            <div className="text-xl font-semibold">Heading 6 - 20px</div>
            <div className="text-lg">Large Text - 18px</div>
            <div className="text-base">Body Text - 16px</div>
            <div className="text-sm">Small Text - 14px</div>
            <div className="text-xs">Caption - 12px</div>
            <div className="text-xxs">Tiny - 10px</div>
          </div>
        </Card>

        {/* Spacing System */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Spacing System (4px base)
          </h2>
          <div className="space-y-2">
            {Object.entries(ds.spacing).map(([key, value]) => (
              <div key={key} className="flex items-center gap-4">
                <div className="w-16 text-sm font-mono">{key}:</div>
                <div 
                  className="bg-primary-200 dark:bg-primary-800" 
                  style={{ width: value, height: '16px' }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Color System */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Color System
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Primary Colors */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Primary</h3>
              <div className="space-y-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                  <div key={shade} className="flex items-center gap-2">
                    <div 
                      className={`w-8 h-8 rounded border border-gray-200 bg-primary-${shade}`}
                    />
                    <span className="text-sm font-mono">primary-{shade}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Colors */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Success</h3>
              <div className="space-y-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                  <div key={shade} className="flex items-center gap-2">
                    <div 
                      className={`w-8 h-8 rounded border border-gray-200 bg-success-${shade}`}
                    />
                    <span className="text-sm font-mono">success-{shade}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Colors */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Danger</h3>
              <div className="space-y-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                  <div key={shade} className="flex items-center gap-2">
                    <div 
                      className={`w-8 h-8 rounded border border-gray-200 bg-danger-${shade}`}
                    />
                    <span className="text-sm font-mono">danger-{shade}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Button Variants */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Button System
          </h2>
          
          {/* Sizes */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Sizes</h3>
            <div className="flex items-center gap-4 flex-wrap">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          {/* Variants */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Variants</h3>
            <div className="flex items-center gap-4 flex-wrap">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="success">Success</Button>
            </div>
          </div>

          {/* With Icons */}
          <div>
            <h3 className="text-lg font-semibold mb-4">With Icons</h3>
            <div className="flex items-center gap-4 flex-wrap">
              <Button leftIcon={<Star size={16} />}>Starred</Button>
              <Button variant="outline" rightIcon={<Heart size={16} />}>Like</Button>
              <Button variant="success" leftIcon={<Zap size={16} />}>Powered</Button>
            </div>
          </div>
        </Card>

        {/* Badge System */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Badge System
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Variants</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Sizes</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge size="sm">Small</Badge>
                <Badge size="md">Medium</Badge>
                <Badge size="lg">Large</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Shadow System */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Shadow System
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xs">
              <div className="text-sm font-semibold">XS Shadow</div>
              <div className="text-xs text-gray-500">shadow-xs</div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="text-sm font-semibold">SM Shadow</div>
              <div className="text-xs text-gray-500">shadow-sm</div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="text-sm font-semibold">MD Shadow</div>
              <div className="text-xs text-gray-500">shadow-md</div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="text-sm font-semibold">LG Shadow</div>
              <div className="text-xs text-gray-500">shadow-lg</div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
              <div className="text-sm font-semibold">XL Shadow</div>
              <div className="text-xs text-gray-500">shadow-xl</div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
              <div className="text-sm font-semibold">2XL Shadow</div>
              <div className="text-xs text-gray-500">shadow-2xl</div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-glass">
              <div className="text-sm font-semibold">Glass Shadow</div>
              <div className="text-xs text-gray-500">shadow-glass</div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-inner">
              <div className="text-sm font-semibold">Inner Shadow</div>
              <div className="text-xs text-gray-500">shadow-inner</div>
            </div>
          </div>
        </Card>

        {/* Animation System */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Animation System
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 bg-primary-100 dark:bg-primary-900 rounded-lg animate-pulse">
              <Sparkles className="mx-auto mb-2" />
              <div className="text-sm font-semibold text-center">Pulse</div>
            </div>
            <div className="p-4 bg-success-100 dark:bg-success-900 rounded-lg animate-bounce-gentle">
              <Sparkles className="mx-auto mb-2" />
              <div className="text-sm font-semibold text-center">Bounce Gentle</div>
            </div>
            <div className="p-4 bg-warning-100 dark:bg-warning-900 rounded-lg animate-float">
              <Sparkles className="mx-auto mb-2" />
              <div className="text-sm font-semibold text-center">Float</div>
            </div>
            <div className="p-4 bg-danger-100 dark:bg-danger-900 rounded-lg animate-wiggle">
              <Sparkles className="mx-auto mb-2" />
              <div className="text-sm font-semibold text-center">Wiggle</div>
            </div>
          </div>
        </Card>

        {/* Form Elements */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Form System
          </h2>
          <div className="space-y-6 max-w-md">
            <Input 
              label="Standard Input"
              placeholder="Enter some text..."
            />
            <Input 
              label="Required Input"
              placeholder="This field is required"
              required
              helperText="This is helper text"
            />
            <Input 
              label="Error State"
              placeholder="Input with error"
              error="This field has an error"
            />
            <Input 
              label="With Icon"
              placeholder="Search..."
              leftIcon={<Star size={16} />}
            />
          </div>
        </Card>

      </div>
    </div>
  )
}