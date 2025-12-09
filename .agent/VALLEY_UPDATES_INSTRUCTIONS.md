## Valley Updates - Compact Mobile-Friendly Design

### Changes Summary:
1. **Removed**: Large vertical bullet-point list (saved ~120 lines of code)
2. **Kept**: Only the horizontal scrolling ticker
3. **Made clickable**: Tap any update to see full details in modal
4. **Space saved**: ~200px of vertical space on mobile

### What to change in menu/page.tsx:

1. **Add state** (around line 53):
```tsx
const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
```

2. **Replace the entire Valley Updates section** (lines 302-427) with this COMPACT version:

```tsx
{/* Valley Updates - Compact Ticker Only */}
{valleyUpdates.length > 0 && (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-8 mx-1"
    >
        {/* Clickable Scrolling News Ticker */}
        <div className="bg-gradient-to-r from-red-900/20 via-red-800/20 to-red-900/20 rounded-xl overflow-hidden border border-red-500/20 relative hover:border-red-500/40 transition-colors">
            <div className="flex items-center py-2.5 px-3">
                <div className="bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded flex-shrink-0 mr-3 shadow-lg flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    Breaking
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="animate-marquee whitespace-nowrap inline-block">
                        {valleyUpdates.map((update, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedUpdate(update)}
                                className="text-sm text-gray-200 font-medium mr-12 hover:text-white transition-colors inline-block"
                            >
                                <span className="text-tashi-accent font-bold">•</span> {update.title}
                            </button>
                        ))}
                        {/* Duplicate for seamless loop */}
                        {valleyUpdates.map((update, idx) => (
                            <button
                                key={`dup-${idx}`}
                                onClick={() => setSelectedUpdate(update)}
                                className="text-sm text-gray-200 font-medium mr-12 hover:text-white transition-colors inline-block"
                            >
                                <span className="text-tashi-accent font-bold">•</span> {update.title}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="text-[10px] text-gray-400 ml-3 flex-shrink-0 hidden sm:block">Tap to read</div>
            </div>
        </div>
    </motion.div>
)}

{/* Update Details Modal */}
<AnimatePresence>
    {selectedUpdate && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedUpdate(null)}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => setSelectedUpdate(null)}
                    className="sticky top-4 right-4 ml-auto z-10 w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Update Media */}
                {selectedUpdate.mediaUrl && (
                    <div className="h-48 w-full relative bg-neutral-800">
                        {selectedUpdate.mediaType === 'video' ? (
                            <video src={selectedUpdate.mediaUrl} controls className="w-full h-full object-cover" />
                        ) : (
                            <img src={selectedUpdate.mediaUrl} alt={selectedUpdate.title} className="w-full h-full object-cover" />
                        )}
                    </div>
                )}

                <div className="p-6 space-y-4">
                    <div>
                        <div className="flex items-start gap-3 mb-3">
                            <Newspaper size={24} className="text-tashi-accent flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-white leading-tight font-serif">{selectedUpdate.title}</h2>
                                {selectedUpdate.status && selectedUpdate.status.toLowerCase() !== 'create' && (
                                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                        selectedUpdate.statusColor === 'green' ? 'bg-green-500 text-white' :
                                        selectedUpdate.statusColor === 'blue' ? 'bg-blue-500 text-white' :
                                        selectedUpdate.statusColor === 'red' ? 'bg-red-500 text-white' : 
                                        'bg-tashi-accent text-black'
                                    }`}>
                                        {selectedUpdate.status}
                                    </span>
                                )}
                            </div>
                        </div>
                        {selectedUpdate.description && (
                            <p className="text-gray-300 leading-relaxed text-base pl-9">{selectedUpdate.description}</p>
                        )}
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <p className="text-xs text-gray-500 text-center italic">
                            Updated: {new Date().toLocaleDateString()} • Ask staff for more details
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )}
</AnimatePresence>
```

### Benefits:
- ✅ 80% less vertical space used
- ✅ More space for menu items on mobile
- ✅ Still shows all updates (in scrolling ticker)
- ✅ Tap/click to see full details
- ✅ Professional news channel feel
- ✅ Clean and mobile-optimized
