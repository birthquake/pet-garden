import React, { useState, useEffect } from 'react';
import { Heart, Droplets, Smile, Clock } from 'lucide-react';

export default function PetGardenSim() {
  // Pet stats
  const [pet, setPet] = useState({
    name: 'Bloom',
    health: 70,
    hunger: 40,
    happiness: 60,
    growth: 0, // 0-100, determines stage
    lastFed: Date.now(),
    lastWatered: Date.now(),
    lastPlayed: Date.now(),
  });

  const [message, setMessage] = useState('Welcome to your garden! 🌱');
  const [cooldowns, setCooldowns] = useState({});

  // Simulate time-based decay
  useEffect(() => {
    const interval = setInterval(() => {
      setPet(prev => {
        const timeSinceUpdate = Date.now() - prev.lastFed;
        const hoursPassed = timeSinceUpdate / (1000 * 60 * 60);
        
        return {
          ...prev,
          health: Math.max(0, prev.health - hoursPassed * 2),
          hunger: Math.min(100, prev.hunger + hoursPassed * 3),
          happiness: Math.max(0, prev.happiness - hoursPassed * 1),
          growth: Math.min(100, prev.growth + hoursPassed * 0.5),
        };
      });
    }, 1000); // Update every second for demo, adjust as needed

    return () => clearInterval(interval);
  }, []);

  // Cooldown management
  useEffect(() => {
    const timer = setInterval(() => {
      setCooldowns(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (updated[key] > 0) {
            updated[key] -= 1;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const performAction = (action, statChanges, cooldownSeconds, feedbackMsg) => {
    if (cooldowns[action] > 0) {
      setMessage(`⏱️ ${action} is on cooldown for ${cooldowns[action]}s`);
      return;
    }

    setPet(prev => ({
      ...prev,
      ...statChanges,
      [action === 'feed' ? 'lastFed' : action === 'water' ? 'lastWatered' : 'lastPlayed']: Date.now(),
    }));

    setCooldowns(prev => ({
      ...prev,
      [action]: cooldownSeconds,
    }));

    setMessage(feedbackMsg);
  };

  const feed = () => {
    performAction('feed', {
      hunger: Math.max(0, pet.hunger - 30),
      health: Math.min(100, pet.health + 5),
    }, 120, '🍎 Nom nom! Your pet is happy!');
  };

  const water = () => {
    performAction('water', {
      health: Math.min(100, pet.health + 20),
      happiness: Math.min(100, pet.happiness + 10),
    }, 240, '💧 Refreshed! Your garden is thriving!');
  };

  const play = () => {
    performAction('play', {
      happiness: Math.min(100, pet.happiness + 25),
      hunger: Math.min(100, pet.hunger + 10),
    }, 60, '🎮 Wheee! Your pet is having fun!');
  };

  const talk = () => {
    performAction('talk', {
      happiness: Math.min(100, pet.happiness + 5),
    }, 10, '💬 Your pet feels a little better!');
  };

  // Determine growth stage and visual
  const getGrowthStage = () => {
    if (pet.growth < 25) return { stage: 'Seed 🌰', emoji: '🌰' };
    if (pet.growth < 50) return { stage: 'Sprout 🌱', emoji: '🌱' };
    if (pet.growth < 75) return { stage: 'Growing 🌿', emoji: '🌿' };
    return { stage: 'Blooming 🌸', emoji: '🌸' };
  };

  const growthInfo = getGrowthStage();
  const isUnhealthy = pet.health < 30;
  const isPetHappy = pet.happiness > 70;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-700 mb-2">{pet.name}'s Garden</h1>
          <p className="text-gray-600">{growthInfo.stage}</p>
        </div>

        {/* Pet Display */}
        <div className={`text-center py-12 px-6 rounded-lg mb-6 transition-all ${
          isUnhealthy ? 'bg-red-50' : isPetHappy ? 'bg-green-50' : 'bg-yellow-50'
        }`}>
          <div className="text-7xl mb-3">{growthInfo.emoji}</div>
          <p className="text-2xl font-bold text-gray-800 mb-2">{pet.name}</p>
          <p className="text-gray-600 h-6">{message}</p>
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-6">
          <StatBar icon={Heart} label="Health" value={Math.round(pet.health)} color="red" />
          <StatBar icon={Clock} label="Hunger" value={Math.round(pet.hunger)} color="orange" />
          <StatBar icon={Smile} label="Happiness" value={Math.round(pet.happiness)} color="yellow" />
          <StatBar icon={Droplets} label="Growth" value={Math.round(pet.growth)} color="green" />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <ActionButton
            label="Feed"
            onClick={feed}
            cooldown={cooldowns.feed}
            emoji="🍎"
          />
          <ActionButton
            label="Water"
            onClick={water}
            cooldown={cooldowns.water}
            emoji="💧"
          />
          <ActionButton
            label="Play"
            onClick={play}
            cooldown={cooldowns.play}
            emoji="🎮"
          />
          <ActionButton
            label="Talk"
            onClick={talk}
            cooldown={cooldowns.talk}
            emoji="💬"
          />
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t text-center text-xs text-gray-500">
          <p>Check back regularly to care for your pet!</p>
        </div>
      </div>
    </div>
  );
}

function StatBar({ icon: Icon, label, value, color }) {
  const colorMap = {
    red: 'bg-red-200',
    orange: 'bg-orange-200',
    yellow: 'bg-yellow-200',
    green: 'bg-green-200',
  };

  return (
    <div className="flex items-center gap-2">
      <Icon size={18} className={`text-${color}-600`} />
      <span className="w-16 text-sm font-medium">{label}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className={`${colorMap[color]} h-full transition-all duration-300`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="w-8 text-right text-sm font-semibold">{Math.round(value)}</span>
    </div>
  );
}

function ActionButton({ label, onClick, cooldown, emoji }) {
  const isOnCooldown = cooldown > 0;

  return (
    <button
      onClick={onClick}
      disabled={isOnCooldown}
      className={`p-3 rounded-lg font-semibold transition-all ${
        isOnCooldown
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
          : 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
      }`}
    >
      <div className="text-xl mb-1">{emoji}</div>
      <div className="text-sm">{label}</div>
      {isOnCooldown && <div className="text-xs mt-1">{cooldown}s</div>}
    </button>
  );
}
