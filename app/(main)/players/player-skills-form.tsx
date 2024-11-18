import { useState } from 'react';
import { Loader2 } from 'lucide-react';
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
import { Player, SkillScale } from '@/lib/models';

// Map skill names to their descriptions
const skillDescriptions: Record<SkillKey, string> = {
  serving: `Ability to serve the ball. Rate yourself based on the following criteria:
   * Consistency: How often they can serve without faults.
   * Power: Ability to serve with speed or power.
   * Accuracy: Ability to place serves effectively (e.g., targeting specific zones).
  `,
  passing: `Ability to pass the ball. Rate yourself based on the following criteria:
   * Control: Ability to control the ball to the setter accurately.
   * Positioning: Skill in moving into position for a good pass.
   * First Contact: Ability to handle difficult serves or spikes.
  `,
  blocking: `Ability to block the ball. Rate yourself based on the following criteria:
   * Timing: Ability to time jumps effectively against opponents.
   * Positioning: Skill in positioning for solo or double blocks.
   * Reading Attacks: Ability to anticipate where an attacker will hit.
  `,
  hittingSpiking: `Ability to hit/spike the ball. Rate yourself based on the following criteria:
   * Power: Strength and speed in attacking the ball.
   * Placement: Ability to hit accurately to different zones.
   * Timing: Ability to time jumps well to connect with sets.
  `,
  defenseDigging: `Ability to defense/dig the ball. Rate yourself based on the following criteria:
   * Reaction Time: Quickness in reacting to spikes or hard-driven balls.
   * Footwork: Ability to move into position for a good dig.
   * Ball Control: Skill in keeping digs playable for teammates.
  `,
  athleticism: `Ability to pass the ball. Rate yourself based on the following criteria:
   * Speed and Agility: Overall quickness on the court.
   * Vertical Jump: Jumping height, especially for spiking and blocking.
   * Stamina: Physical endurance for longer matches or games.
  `
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
      {skillCategories.map((category) => (
        <Card key={category.title}>
          <CardHeader>
            <CardTitle className="text-lg">{category.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div key={category.skill}>
                <Label
                  htmlFor={category.skill}
                  className="block text-sm font-medium text-gray-700 capitalize mb-1"
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
                      .filter((key) => isNaN(Number(key))) // filter out numeric keys
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
                <p className="text-sm text-gray-500 mt-1">
                  {skillDescriptions[category.skill as SkillKey]}
                </p>
              </div>
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
