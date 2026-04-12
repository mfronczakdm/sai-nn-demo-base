'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BookOpen,
  Building2,
  Check,
  GraduationCap,
  Layers,
  Package,
  RotateCcw,
  Save,
  Settings2,
  Sparkles,
} from 'lucide-react';

import { useDemoPersona } from '@/hooks/useDemoPersona';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const TUG_TRACK_OPTIONS = [
  'Product Innovation',
  'Test Engineering Best Practices',
  'Digital Transformation',
  'AI and Analytics',
  'Manufacturing Excellence',
  'Customer Experience',
  'Quality and Compliance',
] as const;

const DIVISION_OPTIONS = [
  'Semiconductor Test',
  'Robotics',
  'Defense & Aerospace',
  'Industrial Automation',
  'Life Sciences',
  'Software & Services',
] as const;

const PRODUCT_OPTIONS = [
  'UltraFLEXPlus',
  'Spectrum 93000',
  'J750',
  'ETS-364',
  'LitePoint IQxel',
  'MiR250',
  'MiR600',
] as const;

const TOPIC_OF_INTEREST_OPTIONS = [
  'Robotics & cobots',
  'Semiconductor fundamentals',
  'Test & measurement basics',
  'AI for automation',
  'Career skills & professional ethics',
  'Data analysis for lab reports',
  'Safety & compliance intro',
] as const;

const ACADEMIC_PROGRAM_OPTIONS = [
  'Undergraduate lab course',
  'Capstone / senior design',
  'Graduate research',
  'Industry co-op prep',
  'Open learning / audit track',
  'Faculty or TA resources',
] as const;

const LAB_SOFTWARE_OPTIONS = [
  'PolyScope teaching bundle',
  'MiR Fleet academic pack',
  'IG-XL lab license',
  'UR+ curriculum add-ons',
  'Student portfolio templates',
  'Learning Services video packs',
  'Simulation-only toolchain',
] as const;

type TugTrack = (typeof TUG_TRACK_OPTIONS)[number];
type Division = (typeof DIVISION_OPTIONS)[number];
type Product = (typeof PRODUCT_OPTIONS)[number];
type StudentTopic = (typeof TOPIC_OF_INTEREST_OPTIONS)[number];
type StudentProgram = (typeof ACADEMIC_PROGRAM_OPTIONS)[number];
type LabSoftware = (typeof LAB_SOFTWARE_OPTIONS)[number];

function toggleInList<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export default function UserPreferencesPanel() {
  const { isStudent } = useDemoPersona();

  const [tugTracks, setTugTracks] = useState<TugTrack[]>([
    'Test Engineering Best Practices',
    'AI and Analytics',
  ]);
  const [divisions, setDivisions] = useState<Division[]>(['Semiconductor Test', 'Robotics']);
  const [products, setProducts] = useState<Product[]>(['UltraFLEXPlus', 'J750']);

  const [topics, setTopics] = useState<StudentTopic[]>(['Robotics & cobots', 'AI for automation']);
  const [programs, setPrograms] = useState<StudentProgram[]>([
    'Capstone / senior design',
    'Industry co-op prep',
  ]);
  const [labSoftware, setLabSoftware] = useState<LabSoftware[]>([
    'PolyScope teaching bundle',
    'IG-XL lab license',
  ]);

  const handleTugToggle = useCallback((label: TugTrack) => {
    setTugTracks((prev) => toggleInList(prev, label));
  }, []);

  const handleDivisionToggle = useCallback((label: Division) => {
    setDivisions((prev) => toggleInList(prev, label));
  }, []);

  const handleProductToggle = useCallback((label: Product) => {
    setProducts((prev) => toggleInList(prev, label));
  }, []);

  const handleTopicToggle = useCallback((label: StudentTopic) => {
    setTopics((prev) => toggleInList(prev, label));
  }, []);

  const handleProgramToggle = useCallback((label: StudentProgram) => {
    setPrograms((prev) => toggleInList(prev, label));
  }, []);

  const handleLabSoftwareToggle = useCallback((label: LabSoftware) => {
    setLabSoftware((prev) => toggleInList(prev, label));
  }, []);

  const handleReset = useCallback(() => {
    if (isStudent) {
      setTopics([]);
      setPrograms([]);
      setLabSoftware([]);
    } else {
      setTugTracks([]);
      setDivisions([]);
      setProducts([]);
    }
  }, [isStudent]);

  const handleSave = useCallback(() => {
    if (isStudent) {
      console.log('Teradyne eKnowledge — student preferences saved', {
        topicsOfInterest: topics,
        academicPrograms: programs,
        labSoftware,
        savedAt: new Date().toISOString(),
      });
    } else {
      console.log('Teradyne eKnowledge — user preferences saved', {
        tugTracks,
        divisions,
        products,
        savedAt: new Date().toISOString(),
      });
    }
  }, [isStudent, topics, programs, labSoftware, tugTracks, divisions, products]);

  const selectionSummary = useMemo(() => {
    if (isStudent) {
      return [
        ...topics.map((label) => ({ category: 'Topic' as const, label })),
        ...programs.map((label) => ({ category: 'Program' as const, label })),
        ...labSoftware.map((label) => ({ category: 'Lab software' as const, label })),
      ];
    }
    return [
      ...tugTracks.map((label) => ({ category: 'TUG track' as const, label })),
      ...divisions.map((label) => ({ category: 'Division' as const, label })),
      ...products.map((label) => ({ category: 'Product' as const, label })),
    ];
  }, [isStudent, topics, programs, labSoftware, tugTracks, divisions, products]);

  const emptySummaryHint = isStudent
    ? 'No preferences selected yet. Choose topics, programs, or lab software above.'
    : 'No preferences selected yet. Choose tracks, divisions, or products above.';

  return (
    <Card className="border-border/80 bg-card/95 shadow-md backdrop-blur-sm transition-shadow hover:shadow-lg">
      <CardHeader className="space-y-1 border-b border-border/60 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <Settings2 className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
                User Preferences
              </CardTitle>
              <CardDescription className="mt-1.5 text-sm leading-relaxed">
                {isStudent
                  ? 'Tell us what you study and build so we can tailor labs, downloads, and search.'
                  : 'Manage your interests to personalize your experience'}
              </CardDescription>
              <p className="text-muted-foreground mt-2 flex items-center gap-1.5 text-xs">
                <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {isStudent
                  ? 'Teradyne eKnowledge — student & teaching portal personalization'
                  : 'Teradyne eKnowledge — portal personalization'}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 pt-8">
        {isStudent ? (
          <>
            <section aria-labelledby="prefs-topics-heading" className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="text-muted-foreground h-4 w-4" aria-hidden />
                <h2 id="prefs-topics-heading" className="text-sm font-semibold tracking-tight">
                  Topics of interest
                </h2>
                <span className="text-muted-foreground text-xs font-normal">(multi-select)</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Pick themes that match your coursework, research, or club projects—we use them to prioritize
                teaching bundles and lab-friendly content.
              </p>
              <div className="flex flex-wrap gap-2">
                {TOPIC_OF_INTEREST_OPTIONS.map((label) => {
                  const selected = topics.includes(label);
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => handleTopicToggle(label)}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200',
                        'hover:border-primary/50 hover:bg-accent/50 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                        selected
                          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                          : 'border-border bg-background text-foreground'
                      )}
                    >
                      {selected && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />}
                      {label}
                    </button>
                  );
                })}
              </div>
            </section>

            <Separator className="bg-border/80" />

            <section aria-labelledby="prefs-programs-heading" className="space-y-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="text-muted-foreground h-4 w-4" aria-hidden />
                <h2 id="prefs-programs-heading" className="text-sm font-semibold tracking-tight">
                  Academic programs
                </h2>
                <span className="text-muted-foreground text-xs font-normal">(multi-select)</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Helps us surface the right depth—intro labs, capstone rubrics, or co-op readiness materials.
              </p>
              <div className="flex flex-wrap gap-2">
                {ACADEMIC_PROGRAM_OPTIONS.map((label) => {
                  const selected = programs.includes(label);
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => handleProgramToggle(label)}
                      className={cn(
                        'rounded-full transition-transform duration-200',
                        'hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
                      )}
                    >
                      <Badge
                        variant={selected ? 'default' : 'outline'}
                        className={cn(
                          'cursor-pointer px-3 py-1.5 text-xs font-medium transition-colors duration-200',
                          selected && 'shadow-sm',
                          !selected && 'hover:bg-muted/80'
                        )}
                      >
                        {selected && <Check className="mr-1 inline h-3 w-3" aria-hidden />}
                        {label}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </section>

            <Separator className="bg-border/80" />

            <section aria-labelledby="prefs-lab-sw-heading" className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="text-muted-foreground h-4 w-4" aria-hidden />
                <h2 id="prefs-lab-sw-heading" className="text-sm font-semibold tracking-tight">
                  Lab software & tools
                </h2>
                <span className="text-muted-foreground text-xs font-normal">(multi-select)</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Teaching licenses, simulation packs, and templates you actually open during the semester.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {LAB_SOFTWARE_OPTIONS.map((label) => {
                  const selected = labSoftware.includes(label);
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => handleLabSoftwareToggle(label)}
                      className={cn(
                        'text-left transition-all duration-200',
                        'hover:border-primary/40 focus-visible:ring-ring rounded-lg border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                        selected
                          ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                          : 'border-border bg-muted/20 hover:bg-muted/40'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 p-4">
                        <span className="text-sm font-medium leading-snug">{label}</span>
                        <span
                          className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-transparent transition-colors duration-200',
                            selected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground/30 bg-background'
                          )}
                          aria-hidden
                        >
                          {selected && <Check className="h-3.5 w-3.5" />}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        ) : (
          <>
            <section aria-labelledby="prefs-tug-heading" className="space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="text-muted-foreground h-4 w-4" aria-hidden />
                <h2 id="prefs-tug-heading" className="text-sm font-semibold tracking-tight">
                  TUG tracks
                </h2>
                <span className="text-muted-foreground text-xs font-normal">(multi-select)</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Choose the topics you want to follow across Teradyne user groups and learning paths.
              </p>
              <div className="flex flex-wrap gap-2">
                {TUG_TRACK_OPTIONS.map((label) => {
                  const selected = tugTracks.includes(label);
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => handleTugToggle(label)}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200',
                        'hover:border-primary/50 hover:bg-accent/50 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                        selected
                          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                          : 'border-border bg-background text-foreground'
                      )}
                    >
                      {selected && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />}
                      {label}
                    </button>
                  );
                })}
              </div>
            </section>

            <Separator className="bg-border/80" />

            <section aria-labelledby="prefs-divisions-heading" className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="text-muted-foreground h-4 w-4" aria-hidden />
                <h2 id="prefs-divisions-heading" className="text-sm font-semibold tracking-tight">
                  Divisions
                </h2>
                <span className="text-muted-foreground text-xs font-normal">(multi-select)</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Narrow content to the business units most relevant to your role.
              </p>
              <div className="flex flex-wrap gap-2">
                {DIVISION_OPTIONS.map((label) => {
                  const selected = divisions.includes(label);
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => handleDivisionToggle(label)}
                      className={cn(
                        'rounded-full transition-transform duration-200',
                        'hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
                      )}
                    >
                      <Badge
                        variant={selected ? 'default' : 'outline'}
                        className={cn(
                          'cursor-pointer px-3 py-1.5 text-xs font-medium transition-colors duration-200',
                          selected && 'shadow-sm',
                          !selected && 'hover:bg-muted/80'
                        )}
                      >
                        {selected && <Check className="mr-1 inline h-3 w-3" aria-hidden />}
                        {label}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </section>

            <Separator className="bg-border/80" />

            <section aria-labelledby="prefs-products-heading" className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="text-muted-foreground h-4 w-4" aria-hidden />
                <h2 id="prefs-products-heading" className="text-sm font-semibold tracking-tight">
                  Products
                </h2>
                <span className="text-muted-foreground text-xs font-normal">(multi-select)</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Highlight platforms and solutions you work with day to day.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PRODUCT_OPTIONS.map((label) => {
                  const selected = products.includes(label);
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => handleProductToggle(label)}
                      className={cn(
                        'text-left transition-all duration-200',
                        'hover:border-primary/40 focus-visible:ring-ring rounded-lg border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                        selected
                          ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                          : 'border-border bg-muted/20 hover:bg-muted/40'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 p-4">
                        <span className="text-sm font-medium leading-snug">{label}</span>
                        <span
                          className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-transparent transition-colors duration-200',
                            selected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground/30 bg-background'
                          )}
                          aria-hidden
                        >
                          {selected && <Check className="h-3.5 w-3.5" />}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}

        <Separator className="bg-border/80" />

        <section aria-labelledby="prefs-summary-heading" className="space-y-3">
          <h2 id="prefs-summary-heading" className="text-sm font-semibold tracking-tight">
            Current selection
          </h2>
          {selectionSummary.length === 0 ? (
            <p className="text-muted-foreground text-sm">{emptySummaryHint}</p>
          ) : (
            <div className="bg-muted/30 flex flex-wrap gap-2 rounded-lg border border-dashed border-border/80 p-4">
              {selectionSummary.map(({ category, label }) => (
                <Badge
                  key={`${category}-${label}`}
                  variant="secondary"
                  className="gap-1.5 py-1 pl-2 pr-2.5 text-xs font-normal"
                >
                  <span className="text-muted-foreground max-w-[7rem] truncate sm:max-w-[10rem]">
                    {category}
                  </span>
                  <span className="font-medium">{label}</span>
                </Badge>
              ))}
            </div>
          )}
        </section>
      </CardContent>

      <CardFooter className="border-border/60 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="w-full transition-colors duration-200 sm:w-auto"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Reset
        </Button>
        <Button
          type="button"
          className="w-full transition-all duration-200 sm:w-auto"
          onClick={handleSave}
        >
          <Save className="h-4 w-4" aria-hidden />
          Save preferences
        </Button>
      </CardFooter>
    </Card>
  );
}
