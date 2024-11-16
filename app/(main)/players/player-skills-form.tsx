'use client';

import { useState } from 'react';
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
import { SelectPlayer, SelectSkillsSet } from '@/lib/db';
import { Loader2 } from 'lucide-react';

type PlayerWithSkills = SelectPlayer & { skills: SelectSkillsSet | null };

const ratingMap: Record<SelectSkillsSet[keyof SelectSkillsSet], string> = {
  '1': 'Beginner',
  '2': 'Novice',
  '3': 'Developing',
  '4': 'Competent',
  '5': 'Proficient',
  '6': 'Skilled',
  '7': 'Advanced',
  '8': 'Expert',
  '9': 'Master',
  '10': 'Elite'
};

// Map skill names to their descriptions
const skillDescriptions: Record<SkillKey, string> = {
  servingConsistency: 'Ability to consistently serve the ball with accuracy.',
  servingPower: 'Power behind the serve, affecting speed and trajectory.',
  servingAccuracy: 'Ability to place the serve precisely in the right zone.',
  passingControl:
    'Control over the ball during passing, ensuring proper setup.',
  passingPositioning: 'Proper positioning for effective passing.',
  passingFirstContact:
    'Quality of the first contact with the ball during passing.',
  settingAccuracy: 'Precision in setting up teammates for an attack.',
  settingDecisionMaking:
    'Ability to choose the right set for different situations.',
  settingConsistency: 'Reliability in setting accurate and successful passes.',
  hittingSpikingPower: 'Power and force in spiking the ball.',
  hittingSpikingPlacement: 'Placing the ball effectively during spikes.',
  hittingSpikingTiming: 'Timing of the attack to catch the opponent off guard.',
  blockingTiming: 'Precision in timing jumps for blocking.',
  blockingPositioning: 'Positioning for an effective block against attacks.',
  blockingReadingAttacks:
    'Ability to read and predict the opponent’s attack patterns.',
  defenseReactionTime: 'Quick reaction to the ball in defense.',
  defenseFootwork: 'Proper foot movement for effective defense positioning.',
  defenseBallControl: 'Ability to control the ball during defensive actions.',
  teamPlayCommunication:
    'Effective communication and coordination with teammates.',
  teamPlayPositionalAwareness:
    'Understanding of teammates’ positions and movements.',
  teamPlayAdaptability: 'Ability to adapt to changes during team play.',
  athleticismSpeedAgility: 'Quickness and agility in movement on the court.',
  athleticismVerticalJump: 'Jumping ability, crucial for blocking and spiking.',
  athleticismStamina:
    'Endurance to maintain peak performance throughout the game.'
};

type SkillKey = keyof Omit<SelectSkillsSet, 'id' | 'playerId'>;

export function PlayerSkillsForm({
  player,
  onSave,
  onCancel
}: {
  player: PlayerWithSkills;
  onSave: (skills: SelectSkillsSet) => Promise<void>;
  onCancel: () => void;
}) {
  const [skills, setSkills] = useState<SelectSkillsSet>(
    player.skills || ({} as SelectSkillsSet)
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Ensure that all skills with null or undefined values are set to '1'
      const updatedSkills = Object.keys(skills).reduce((acc, key) => {
        const skillKey = key as SkillKey;
        acc[skillKey] = skills[skillKey] || '1'; // Set to '1' if not set
        return acc;
      }, {} as SelectSkillsSet);

      await onSave(updatedSkills);
    } catch (error) {
      console.error('Error saving skills:', error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkillChange = (
    skill: SkillKey,
    value: SelectSkillsSet[SkillKey]
  ) => {
    setSkills((prevSkills) => ({
      ...prevSkills,
      [skill]: value
    }));
  };

  const skillCategories = [
    {
      title: 'Serving Skills',
      skills: ['servingConsistency', 'servingPower', 'servingAccuracy']
    },
    {
      title: 'Passing Skills',
      skills: ['passingControl', 'passingPositioning', 'passingFirstContact']
    },
    {
      title: 'Setting Skills',
      skills: ['settingAccuracy', 'settingDecisionMaking', 'settingConsistency']
    },
    {
      title: 'Hitting/Spiking Skills',
      skills: [
        'hittingSpikingPower',
        'hittingSpikingPlacement',
        'hittingSpikingTiming'
      ]
    },
    {
      title: 'Blocking Skills',
      skills: [
        'blockingTiming',
        'blockingPositioning',
        'blockingReadingAttacks'
      ]
    },
    {
      title: 'Defense/Digging Skills',
      skills: ['defenseReactionTime', 'defenseFootwork', 'defenseBallControl']
    },
    {
      title: 'Team Play Skills',
      skills: [
        'teamPlayCommunication',
        'teamPlayPositionalAwareness',
        'teamPlayAdaptability'
      ]
    },
    {
      title: 'Athleticism Skills',
      skills: [
        'athleticismSpeedAgility',
        'athleticismVerticalJump',
        'athleticismStamina'
      ]
    }
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {skillCategories.map((category) => (
        <Card key={category.title}>
          <CardHeader>
            <CardTitle className="text-lg">{category.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {category.skills.map((skill) => (
                <div key={skill}>
                  <Label
                    htmlFor={skill}
                    className="block text-sm font-medium text-gray-700 capitalize mb-1"
                  >
                    {skill.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <Select
                    value={skills[skill as SkillKey] || '1'}
                    onValueChange={(value) =>
                      handleSkillChange(
                        skill as SkillKey,
                        value as SelectSkillsSet[SkillKey]
                      )
                    }
                    disabled={isSaving}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        Object.keys(ratingMap) as Array<keyof typeof ratingMap>
                      ).map((value) => (
                        <SelectItem key={value} value={value.toString()}>
                          {ratingMap[value]} ({value})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    {skillDescriptions[skill as SkillKey]}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
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
