import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Star } from 'lucide-react';

const skills = [
  {
    id: 1,
    title: 'Web Development',
    provider: 'Ammar',
    rating: 4.8,
    available: true,
    category: 'Tech',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500',
  },
  {
    id: 2,
    title: 'Graphic Design',
    provider: 'Priya',
    rating: 4.9,
    available: true,
    category: 'Design',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500',
  },
  {
    id: 3,
    title: 'Language Tutoring',
    provider: 'Rahul',
    rating: 4.7,
    available: false,
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=500',
  },
  {
    id: 4,
    title: 'Music Lessons',
    provider: 'Siddu',
    rating: 5.0,
    available: true,
    category: 'Arts',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500',
  },
];

export default function SkillShare() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold text-center tracking-tight leading-tight">Skill Share</h1>
          <p className="text-base leading-relaxed tracking-wide text-muted-foreground text-center">
            Exchange knowledge and learn new skills from the community
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {skills.map(skill => (
            <Card key={skill.id} className="bg-[#0F172A] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 min-h-[380px] flex flex-col justify-between border border-border overflow-hidden">
              <div className="relative h-48">
                <img
                  src={skill.image}
                  alt={skill.title}
                  className="w-full h-full object-cover rounded-xl"
                />
                {skill.available && (
                  <Badge className="absolute top-3 right-3 bg-green-500">
                    Available Today
                  </Badge>
                )}
              </div>
              <CardContent className="p-5 space-y-4 flex-1">
                <div className="space-y-3 px-2">
                <div className="space-y-2 text-left">
                  <h3 className="font-semibold text-lg">{skill.title}</h3>
                  <Badge variant="outline">{skill.category}</Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground text-left">
                  <User className="w-4 h-4" />
                  <span>{skill.provider}</span>
                </div>

                <div className="flex items-center gap-2 text-left">
                  <Star className="w-5 h-5 fill-accent text-accent" />
                  <span className="font-semibold">{skill.rating}</span>
                </div>

                <Button
                  variant="gradient"
                  className="w-full"
                  disabled={!skill.available}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {skill.available ? 'Schedule Trade' : 'Not Available'}
                </Button>
              </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
