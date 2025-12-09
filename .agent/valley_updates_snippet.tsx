{/* Local News Section - Animated */ }
{
    valleyUpdates.length > 0 && (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-12 bg-neutral-900/50 rounded-2xl p-6 border border-white/5 mx-1 relative overflow-hidden"
        >
            {/* Animated background pulse */}
            <div className="absolute inset-0 bg-gradient-to-r from-tashi-accent/5 via-transparent to-tashi-accent/5 animate-pulse pointer-events-none" />

            <div className="relative z-10">
                {/* Header with pulsing LIVE indicator */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-tashi-accent font-serif text-xl font-bold flex items-center gap-2">
                        <Newspaper size={20} className="animate-pulse" /> Valley Updates
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-ping absolute" />
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Live</span>
                    </div>
                </div>

                {/* Scrolling News Ticker */}
                <div className="bg-gradient-to-r from-red-900/20 via-red-800/20 to-red-900/20 rounded-xl mb-4 overflow-hidden border border-red-500/20 relative">
                    <div className="flex items-center py-2 px-3">
                        <div className="bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded flex-shrink-0 mr-3 shadow-lg">
                            Breaking
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="animate-marquee whitespace-nowrap inline-block">
                                {valleyUpdates.map((update, idx) => (
                                    <span key={idx} className="text-sm text-gray-200 font-medium mr-12">
                                        <span className="text-tashi-accent font-bold">•</span> {update.title}
                                        {update.description && <span className="text-gray-400"> - {update.description}</span>}
                                    </span>
                                ))}
                                {/* Duplicate for seamless loop */}
                                {valleyUpdates.map((update, idx) => (
                                    <span key={`dup-${idx}`} className="text-sm text-gray-200 font-medium mr-12">
                                        <span className="text-tashi-accent font-bold">•</span> {update.title}
                                        {update.description && <span className="text-gray-400"> - {update.description}</span>}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Consolidated card with all updates as bullets */}
                <div className="bg-black/40 p-5 rounded-xl border-l-2 border-tashi-accent/50">
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-gray-200 font-bold text-base">Latest News & Updates</span>
                        <motion.span
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="bg-tashi-accent/20 text-tashi-accent text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-tashi-accent/30"
                        >
                            {valleyUpdates.length} New {valleyUpdates.length === 1 ? 'Update' : 'Updates'}
                        </motion.span>
                    </div>

                    {/* Updates as bullet points with staggered animation */}
                    <motion.ul
                        className="space-y-3"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {valleyUpdates.map((update, idx) => (
                            <motion.li
                                key={idx}
                                variants={itemVariants}
                                className="flex gap-3 group"
                            >
                                {/* Colored bullet indicator based on status */}
                                <div className="flex-shrink-0 mt-1.5">
                                    <motion.div
                                        animate={{ scale: [1, 1.3, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                                        className={`w-2 h-2 rounded-full ${update.statusColor === 'green' ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]' :
                                                update.statusColor === 'blue' ? 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]' :
                                                    update.statusColor === 'red' ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]' :
                                                        'bg-tashi-accent shadow-[0_0_6px_rgba(218,165,32,0.6)]'
                                            }`}
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm text-gray-300 leading-relaxed">
                                            <span className="font-semibold text-white">{update.title}</span>
                                            {update.description && (
                                                <span className="text-gray-400"> — {update.description}</span>
                                            )}
                                        </p>
                                        {update.status && update.status.toLowerCase() !== 'create' && (
                                            <span className={`flex-shrink-0 inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${update.statusColor === 'green' ? 'bg-green-500/20 text-green-400' :
                                                    update.statusColor === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                                                        update.statusColor === 'red' ? 'bg-red-500/20 text-red-400' :
                                                            'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {update.status}
                                            </span>
                                        )}
                                    </div>
                                    {/* Show media if available */}
                                    {update.mediaUrl && (
                                        <div className="mt-2 rounded-lg overflow-hidden border border-white/5 bg-black">
                                            {update.mediaType === 'video' ? (
                                                <video src={update.mediaUrl} controls className="w-full max-h-48 object-cover" />
                                            ) : (
                                                <img src={update.mediaUrl} alt={update.title} className="w-full max-h-48 object-cover" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.li>
                        ))}
                    </motion.ul>
                </div>

                <p className="text-[10px] text-gray-600 text-center mt-3 italic">Updated: {new Date().toLocaleDateString()} • Ask staff for details</p>
            </div>
        </motion.div>
    )
}
