import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';
import { useProfiles } from '../../contexts/ProfilesContext';
import { ProfileAvatar } from './ProfileAvatar';

export const ProfileSelector: React.FC = () => {
  const { t } = useTranslation();
  const {
    profiles,
    currentProfile,
    createProfile,
    setCurrentProfile,
    deleteProfile,
  } = useProfiles();

  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
        setNewProfileName('');
        setSelectedAvatarIndex(0);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus input when creating
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  const handleCreateProfile = () => {
    if (newProfileName.trim()) {
      createProfile(newProfileName.trim(), selectedAvatarIndex);
      setNewProfileName('');
      setSelectedAvatarIndex(0);
      setIsCreating(false);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateProfile();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setNewProfileName('');
    }
  };

  const handleDeleteProfile = (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation();
    if (profiles.length > 1) {
      if (window.confirm(t('profiles.deleteConfirm'))) {
        deleteProfile(profileId);
      }
    }
  };

  if (!currentProfile) {
    return null;
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Main Profile Bubble */}
      <div className="flex items-center gap-2">
        {/* Profile List Dropdown */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 min-w-[200px] max-w-[300px]">
            <div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  onClick={() => {
                    setCurrentProfile(profile.id);
                    setIsOpen(false);
                  }}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors
                    ${currentProfile.id === profile.id
                      ? 'bg-purple-50 dark:bg-purple-900/30'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-lg">
                    <ProfileAvatar profile={profile} size={32} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {profile.name}
                    </div>
                  </div>
                  {currentProfile.id === profile.id && (
                    <div className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 flex-shrink-0" />
                  )}
                  {profiles.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteProfile(e, profile.id)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex-shrink-0"
                      aria-label={t('profiles.delete')}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}

              {/* Create New Profile */}
              {isCreating ? (
                <div className="px-3 py-2 space-y-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('profiles.namePlaceholder')}
                    className="
                      w-full px-3 py-2
                      bg-white dark:bg-gray-700
                      border border-gray-300 dark:border-gray-600
                      rounded-lg
                      text-sm text-gray-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400
                    "
                  />
                  
                  {/* Avatar Selection */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profiles.selectAvatar')}
                    </label>
                    <div className="overflow-x-auto overflow-y-hidden">
                      <div className="flex gap-2 pb-1" style={{ width: 'max-content' }}>
                        {[0, 1, 2, 3, 4].map((index) => {
                          const tempProfile = { 
                            id: 'temp', 
                            name: '', 
                            color: '#8B5CF6', 
                            avatarIndex: index,
                            createdAt: 0
                          };
                          return (
                            <button
                              key={index}
                              onClick={() => setSelectedAvatarIndex(index)}
                              className={`
                                flex-shrink-0 rounded-lg border-2 transition-all flex items-center justify-center
                                ${selectedAvatarIndex === index
                                  ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/30'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                }
                              `}
                              style={{ width: '48px', height: '48px' }}
                            >
                              <ProfileAvatar profile={tempProfile} size={48} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateProfile}
                      disabled={!newProfileName.trim()}
                      className="
                        flex-1 px-3 py-1.5
                        bg-purple-600 hover:bg-purple-700
                        text-white text-sm font-medium
                        rounded-lg
                        transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed
                        cursor-pointer
                      "
                    >
                      {t('common.save')}
                    </button>
                    <button
                      onClick={() => {
                        setIsCreating(false);
                        setNewProfileName('');
                        setSelectedAvatarIndex(0);
                      }}
                      className="
                        px-3 py-1.5
                        bg-gray-100 dark:bg-gray-700
                        hover:bg-gray-200 dark:hover:bg-gray-600
                        text-gray-700 dark:text-gray-300 text-sm font-medium
                        rounded-lg
                        transition-colors
                        cursor-pointer
                      "
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="
                    w-full flex items-center gap-2 px-3 py-2
                    text-gray-600 dark:text-gray-400
                    hover:bg-gray-50 dark:hover:bg-gray-700
                    rounded-lg
                    transition-colors
                    cursor-pointer
                  "
                >
                  <Plus size={16} />
                  <span className="text-sm font-medium">{t('profiles.create')}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Current Profile Image - Clickable */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="
            rounded-lg
            flex items-center justify-center
            transition-all duration-200
            cursor-pointer
            border-2 border-gray-200 dark:border-gray-700
            overflow-hidden
            hover:border-gray-300 dark:hover:border-gray-600
          "
          style={{ 
            width: '40px',
            height: '40px'
          }}
        >
          <ProfileAvatar profile={currentProfile} size={40} />
        </button>
      </div>
    </div>
  );
};

