import React from 'react';
import { motion } from 'framer-motion';
import SocietySubNavigation from './SocietySubNavigation';
import SocietyMessages from './SocietyMessages';
import SocietyEvents from './SocietyEvents';
import SmartTextRenderer from '../../Common/SmartTextRenderer';

const SocietyDetail = ({ societyId, societies, joinSociety, leaveSociety, activeTab, setActiveTab, societyMessages, newSocietyMessage, setNewSocietyMessage, handleSendSocietyMessage, societyEvents, newSocietyEvent, setNewSocietyEvent, handleCreateSocietyEvent }) => {
  const society = societies.find(s => s.id === societyId);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[var(--bg-card)] p-4 rounded shadow"
    >
      <h2 className="text-2xl font-bold">{society?.name}</h2>
      <div>
        <SmartTextRenderer
          text={society?.description || 'No description available.'}
          enableBookLinks={true}
          enableUserMentions={true}
          renderAsHtml={true}
        />
      </div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => joinSociety(societyId)}
          className="bg-[var(--accent)] text-white p-2 rounded"
          disabled={society?.is_member}
        >
          Join
        </button>
        <button
          onClick={() => leaveSociety(societyId)}
          className="bg-red-500 text-white p-2 rounded"
          disabled={!society?.is_member}
        >
          Leave
        </button>
      </div>
      <SocietySubNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'society-messages' && (
        <SocietyMessages
          societyMessages={societyMessages}
          newSocietyMessage={newSocietyMessage}
          setNewSocietyMessage={setNewSocietyMessage}
          handleSendSocietyMessage={handleSendSocietyMessage}
        />
      )}
      {activeTab === 'society-events' && (
        <SocietyEvents
          societyEvents={societyEvents}
          newSocietyEvent={newSocietyEvent}
          setNewSocietyEvent={setNewSocietyEvent}
          handleCreateSocietyEvent={handleCreateSocietyEvent}
        />
      )}
    </motion.div>
  );
};

export default SocietyDetail;