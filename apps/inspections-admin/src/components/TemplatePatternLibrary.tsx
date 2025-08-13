import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  Clock, 
  Star,
  Zap,
  Shield,
  Wrench,
  Building,
  Truck,
  Factory,
  HardHat,
  Clipboard,
  CheckCircle,
  AlertTriangle,
  FileText,
  Camera,
  Edit3,
  Layers,
  Plus,
  ArrowRight
} from 'lucide-react';

interface TemplatePattern {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string;
  estimatedDuration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  preview: {
    sections: number;
    questions: number;
    features: string[];
  };
  metadata: {
    usageCount: number;
    rating: number;
    lastUpdated: string;
  };
}

const SAMPLE_PATTERNS: TemplatePattern[] = [
  {
    id: 'forklift-safety',
    name: 'Daily Forklift Safety Check',
    description: 'Comprehensive pre-use inspection for forklift operations including engine, hydraulics, and safety systems.',
    category: 'Equipment Safety',
    industry: 'Manufacturing',
    estimatedDuration: 15,
    difficulty: 'easy',
    tags: ['forklift', 'daily-check', 'safety', 'equipment'],
    preview: {
      sections: 4,
      questions: 12,
      features: ['Photo capture', 'Conditional logic', 'Digital signature', 'Pass/Fail scoring']
    },
    metadata: {
      usageCount: 2847,
      rating: 4.8,
      lastUpdated: '2024-01-15'
    }
  },
  {
    id: 'fire-safety-monthly',
    name: 'Monthly Fire Safety Inspection',
    description: 'Complete fire safety system inspection covering extinguishers, alarms, exits, and emergency equipment.',
    category: 'Fire Safety',
    industry: 'General',
    estimatedDuration: 30,
    difficulty: 'medium',
    tags: ['fire-safety', 'monthly', 'emergency', 'compliance'],
    preview: {
      sections: 6,
      questions: 24,
      features: ['Multi-location tracking', 'Equipment tagging', 'Photo documentation', 'Compliance reporting']
    },
    metadata: {
      usageCount: 1923,
      rating: 4.9,
      lastUpdated: '2024-01-10'
    }
  },
  {
    id: 'workplace-ergonomics',
    name: 'Workplace Ergonomics Assessment',
    description: 'Detailed ergonomic evaluation of workstations, seating, lighting, and repetitive task analysis.',
    category: 'Health & Safety',
    industry: 'Office',
    estimatedDuration: 45,
    difficulty: 'hard',
    tags: ['ergonomics', 'workplace', 'health', 'assessment'],
    preview: {
      sections: 8,
      questions: 35,
      features: ['Risk scoring', 'Recommendation engine', 'Photo analysis', 'Action planning']
    },
    metadata: {
      usageCount: 856,
      rating: 4.7,
      lastUpdated: '2024-01-08'
    }
  },
  {
    id: 'vehicle-pre-trip',
    name: 'Commercial Vehicle Pre-Trip Inspection',
    description: 'DOT-compliant pre-trip inspection for commercial vehicles including brakes, lights, and cargo securement.',
    category: 'Transportation',
    industry: 'Transportation',
    estimatedDuration: 20,
    difficulty: 'medium',
    tags: ['vehicle', 'pre-trip', 'DOT', 'compliance'],
    preview: {
      sections: 7,
      questions: 18,
      features: ['DOT compliance', 'Defect tracking', 'Driver certification', 'Maintenance alerts']
    },
    metadata: {
      usageCount: 3421,
      rating: 4.9,
      lastUpdated: '2024-01-12'
    }
  },
  {
    id: 'confined-space',
    name: 'Confined Space Entry Permit',
    description: 'Complete confined space entry checklist with atmospheric testing, rescue procedures, and safety protocols.',
    category: 'Permit Required',
    industry: 'Industrial',
    estimatedDuration: 25,
    difficulty: 'hard',
    tags: ['confined-space', 'permit', 'atmospheric', 'rescue'],
    preview: {
      sections: 5,
      questions: 22,
      features: ['Atmospheric readings', 'Multi-role approval', 'Emergency contacts', 'Real-time monitoring']
    },
    metadata: {
      usageCount: 1247,
      rating: 4.8,
      lastUpdated: '2024-01-14'
    }
  },
  {
    id: 'food-safety-haccp',
    name: 'Food Safety HACCP Inspection',
    description: 'HACCP-compliant food safety inspection covering critical control points and temperature monitoring.',
    category: 'Food Safety',
    industry: 'Food Service',
    estimatedDuration: 35,
    difficulty: 'medium',
    tags: ['food-safety', 'HACCP', 'temperature', 'critical-control'],
    preview: {
      sections: 9,
      questions: 28,
      features: ['Temperature logging', 'Critical limits', 'Corrective actions', 'Trend analysis']
    },
    metadata: {
      usageCount: 2156,
      rating: 4.6,
      lastUpdated: '2024-01-11'
    }
  }
];

interface TemplatePatternLibraryProps {
  onSelectPattern?: (patternId: string) => void;
  showCreateButton?: boolean;
}

export function TemplatePatternLibrary({ onSelectPattern, showCreateButton = true }: TemplatePatternLibraryProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [patterns, setPatterns] = useState<TemplatePattern[]>(SAMPLE_PATTERNS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const categories = [...new Set(patterns.map(p => p.category))];
  const industries = [...new Set(patterns.map(p => p.industry))];

  const filteredPatterns = patterns.filter(pattern => {
    const matchesSearch = pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pattern.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pattern.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || pattern.category === selectedCategory;
    const matchesIndustry = !selectedIndustry || selectedIndustry === 'all' || pattern.industry === selectedIndustry;
    const matchesDifficulty = !selectedDifficulty || selectedDifficulty === 'all' || pattern.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesIndustry && matchesDifficulty;
  });

  const getCategoryIcon = (category: string) => {
    const icons = {
      'Equipment Safety': Wrench,
      'Fire Safety': Shield,
      'Health & Safety': HardHat,
      'Transportation': Truck,
      'Permit Required': FileText,
      'Food Safety': Building,
    };
    return icons[category as keyof typeof icons] || Clipboard;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <CheckCircle className="h-3 w-3" />;
      case 'medium':
        return <Clock className="h-3 w-3" />;
      case 'hard':
        return <Zap className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const handleUsePattern = async (patternId: string) => {
    if (onSelectPattern) {
      onSelectPattern(patternId);
      return;
    }

    try {
      setLoading(true);
      const templateData = await api.templateBuilder.generateFromPattern(patternId, {
        name: `New ${patterns.find(p => p.id === patternId)?.name}`,
        createdBy: user?.id,
      });
      
      toast({
        title: "Template created from pattern",
        description: "Your new template is ready for customization.",
      });
      
      // Navigate to builder or handle success
    } catch (error) {
      toast({
        title: "Failed to create template",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const PatternCard = ({ pattern }: { pattern: TemplatePattern }) => {
    const CategoryIcon = getCategoryIcon(pattern.category);
    
    return (
      <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <CategoryIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base line-clamp-1">{pattern.name}</CardTitle>
                <CardDescription className="text-sm line-clamp-2">
                  {pattern.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{pattern.metadata.rating}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {pattern.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {pattern.industry}
            </Badge>
            <Badge className={`text-xs ${getDifficultyColor(pattern.difficulty)}`}>
              <span className="flex items-center gap-1">
                {getDifficultyIcon(pattern.difficulty)}
                {pattern.difficulty}
              </span>
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{pattern.estimatedDuration}min</span>
            </div>
            <div className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              <span>{pattern.preview.sections} sections</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>{pattern.preview.questions} questions</span>
            </div>
          </div>

          {/* Features */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Key Features</div>
            <div className="flex flex-wrap gap-1">
              {pattern.preview.features.slice(0, 3).map(feature => (
                <Badge key={feature} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {pattern.preview.features.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{pattern.preview.features.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Tags */}
          {pattern.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {pattern.tags.slice(0, 4).map(tag => (
                <span key={tag} className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  #{tag}
                </span>
              ))}
              {pattern.tags.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{pattern.tags.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Used {pattern.metadata.usageCount.toLocaleString()} times
            </div>
            <Button 
              size="sm" 
              onClick={() => handleUsePattern(pattern.id)}
              disabled={loading}
            >
              Use Template
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Template Patterns</h2>
          <p className="text-sm text-muted-foreground">
            Start with proven inspection templates used by thousands of organizations
          </p>
        </div>
        {showCreateButton && (
          <Button onClick={() => onSelectPattern?.('')}>
            <Plus className="h-4 w-4 mr-2" />
            Create from Scratch
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patterns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map(industry => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patterns Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPatterns.map(pattern => (
          <PatternCard key={pattern.id} pattern={pattern} />
        ))}
      </div>

      {/* Empty State */}
      {filteredPatterns.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No patterns found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters.
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedIndustry('all');
                setSelectedDifficulty('all');
              }}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
