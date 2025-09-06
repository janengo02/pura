import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook for preloading media files (images and videos)
 * @param {Array} mediaItems - Array of media objects with src and type properties
 * @returns {Object} - { loadedMedia: Set, isPreloading: boolean, loadProgress: number }
 */
export const useMediaPreloader = (mediaItems = []) => {
  const [loadedMedia, setLoadedMedia] = useState(new Set())
  const [isPreloading, setIsPreloading] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)

  const preloadImage = useCallback((src) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(src)
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
      img.src = src
    })
  }, [])

  const preloadVideo = useCallback((src) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.oncanplaythrough = () => resolve(src)
      video.onerror = () => reject(new Error(`Failed to load video: ${src}`))
      video.preload = 'metadata'
      video.src = src
    })
  }, [])

  const preloadMedia = useCallback((mediaItem) => {
    const { mediaSrc, mediaType } = mediaItem
    
    if (mediaType === 'video') {
      return preloadVideo(mediaSrc)
    } else {
      return preloadImage(mediaSrc)
    }
  }, [preloadImage, preloadVideo])

  useEffect(() => {
    if (!mediaItems.length) {
      setIsPreloading(false)
      setLoadProgress(100)
      return
    }

    let loadedCount = 0
    const totalItems = mediaItems.length

    const updateProgress = () => {
      loadedCount++
      const progress = (loadedCount / totalItems) * 100
      setLoadProgress(progress)
      
      if (loadedCount === totalItems) {
        setIsPreloading(false)
      }
    }

    const loadPromises = mediaItems.map(async (mediaItem) => {
      try {
        const src = await preloadMedia(mediaItem)
        setLoadedMedia(prev => new Set([...prev, src]))
        updateProgress()
        return src
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Media preload failed:', error.message)
        // Still count as "loaded" to prevent hanging
        updateProgress()
        return null
      }
    })

    // Start preloading process
    Promise.allSettled(loadPromises)

    // Cleanup function
    return () => {
      setLoadedMedia(new Set())
      setIsPreloading(true)
      setLoadProgress(0)
    }
  }, [mediaItems, preloadMedia])

  return {
    loadedMedia,
    isPreloading,
    loadProgress,
    isMediaLoaded: useCallback((src) => loadedMedia.has(src), [loadedMedia])
  }
}

export default useMediaPreloader