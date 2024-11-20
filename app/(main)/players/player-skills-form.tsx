'use client';

import { useState } from 'react';
import { Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Player, SkillScale } from '@/lib/models';

// Map skill names to their descriptions
const skillDescriptions: Record<
  SkillKey,
  { title: string; criteria: string[] }
> = {
  serving: {
    title:
      'Ability to serve the ball. Rate yourself based on the following criteria:',
    criteria: [
      'Consistency: How often they can serve without faults.',
      'Power: Ability to serve with speed or power.',
      'Accuracy: Ability to place serves effectively (e.g., targeting specific zones).'
    ]
  },
  passing: {
    title:
      'Ability to pass the ball. Rate yourself based on the following criteria:',
    criteria: [
      'Control: Ability to control the ball to the setter accurately.',
      'Positioning: Skill in moving into position for a good pass.',
      'First Contact: Ability to handle difficult serves or spikes.'
    ]
  },
  blocking: {
    title:
      'Ability to block the ball. Rate yourself based on the following criteria:',
    criteria: [
      'Timing: Ability to time jumps effectively against opponents.',
      'Positioning: Skill in positioning for solo or double blocks.',
      'Reading Attacks: Ability to anticipate where an attacker will hit.'
    ]
  },
  hittingSpiking: {
    title:
      'Ability to hit/spike the ball. Rate yourself based on the following criteria:',
    criteria: [
      'Power: Strength and speed in attacking the ball.',
      'Placement: Ability to hit accurately to different zones.',
      'Timing: Ability to time jumps well to connect with sets.'
    ]
  },
  defenseDigging: {
    title:
      'Ability to defense/dig the ball. Rate yourself based on the following criteria:',
    criteria: [
      'Reaction Time: Quickness in reacting to spikes or hard-driven balls.',
      'Footwork: Ability to move into position for a good dig.',
      'Ball Control: Skill in keeping digs playable for teammates.'
    ]
  },
  athleticism: {
    title:
      'Overall athletic ability. Rate yourself based on the following criteria:',
    criteria: [
      'Speed and Agility: Overall quickness on the court.',
      'Vertical Jump: Jumping height, especially for spiking and blocking.',
      'Stamina: Physical endurance for longer matches or games.'
    ]
  }
};

type SkillKey = keyof Omit<Player, 'id' | 'name' | 'configured'>;

export function PlayerSkillsForm({
  player,
  onSave,
  onCancel
}: {
  player: Player;
  onSave: (player: Player) => Promise<void>;
  onCancel: () => void;
}) {
  const [formPlayer, setFormPlayer] = useState<Player>(player);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formPlayer);
    } catch (error) {
      console.error('Error saving skills:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkillChange = (skill: SkillKey, value: Player[SkillKey]) => {
    setFormPlayer((prevSkills) => ({
      ...prevSkills,
      [skill]: value
    }));
  };

  const skillCategories = [
    { title: 'Serving Skills', skill: 'serving' },
    { title: 'Passing Skills', skill: 'passing' },
    { title: 'Blocking Skills', skill: 'blocking' },
    { title: 'Hitting/Spiking Skills', skill: 'hittingSpiking' },
    { title: 'Defense/Digging Skills', skill: 'defenseDigging' },
    { title: 'Athleticism Skills', skill: 'athleticism' }
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skillCategories.map((category) => (
          <Card key={category.title} className="w-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                {category.title}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-0">
                        <Info className="h-4 w-4" />
                        <span className="sr-only">More info</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs">
                        <p className="mb-2 font-semibold">
                          {skillDescriptions[category.skill as SkillKey].title}
                        </p>
                        <ul className="list-disc pl-4 space-y-1">
                          {skillDescriptions[
                            category.skill as SkillKey
                          ].criteria.map((criterion, index) => (
                            <li key={index} className="text-sm">
                              {criterion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label
                  htmlFor={category.skill}
                  className="text-sm font-medium text-gray-700 capitalize"
                >
                  {category.skill.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                <Select
                  value={formPlayer[category.skill as SkillKey].toString()}
                  onValueChange={(value) =>
                    handleSkillChange(
                      category.skill as SkillKey,
                      parseInt(value, 10) as SkillScale as Player[SkillKey]
                    )
                  }
                  disabled={isSaving}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(SkillScale)
                      .filter((key) => isNaN(Number(key)))
                      .map((key) => (
                        <SelectItem
                          key={key}
                          value={SkillScale[
                            key as keyof typeof SkillScale
                          ].toString()}
                        >
                          {SkillScale[key as keyof typeof SkillScale]} ({key})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
}
