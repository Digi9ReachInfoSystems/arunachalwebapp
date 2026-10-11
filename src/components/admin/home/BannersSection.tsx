import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { addBanner, getBanner, updateBanner, deleteBanner } from "@/service/homeService"
import { useDeletePermission } from "@/hooks/use-delete-permission"
import { ContactAdminModal } from "@/components/ui/contact-admin-modal"
import { getMediaUrl } from "@/utils/mediaUrl"

interface Banner {
  _id: string
  image_url: string
  video_url?: string
  youtube_url?: string
  __v: number
}

export default function BannersSection() {
  const { isAdmin } = useDeletePermission()
  const { toast } = useToast()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState({ banners: false, action: false })
  const [dialogs, setDialogs] = useState({ addBanner: false, editBanner: false })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)

  const fetchBanners = async () => {
    setLoading((prev) => ({ ...prev, banners: true }))
    try {
      const response = await getBanner()
      if (response.success) {
        setBanners(Array.isArray(response.data) ? response.data : [response.data])
      } else {
        toast({ title: "Error", description: response.error || "Failed to fetch banners" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch banners" })
    } finally {
      setLoading((prev) => ({ ...prev, banners: false }))
    }
  }

  const handleAddBanner = async () => {
    if (!selectedFile) {
      toast({ title: "Error", description: "Please select an image file" })
      return
    }
    setLoading((prev) => ({ ...prev, action: true }))
    try {
      const formData = new FormData()
      formData.append("image_url", selectedFile)
      if (selectedVideo) formData.append("video_url", selectedVideo)
      formData.append("youtube_url", youtubeUrl.trim())
      const response = await addBanner(formData)
      if (response.success) {
        toast({ title: "Success", description: response.message || "Banner added successfully" })
        setDialogs((prev) => ({ ...prev, addBanner: false }))
        setSelectedFile(null)
        setSelectedVideo(null)
        setYoutubeUrl("")
        fetchBanners()
      } else {
        toast({ title: "Error", description: response.error || "Failed to add banner" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add banner" })
    } finally {
      setLoading((prev) => ({ ...prev, action: false }))
    }
  }

  const handleUpdateBanner = async () => {
    if (!editingBanner) {
      toast({ title: "Error", description: "Banner not found" })
      return
    }
    setLoading((prev) => ({ ...prev, action: true }))
    try {
      const formData = new FormData()
      if (selectedFile) formData.append("image_url", selectedFile)
      if (selectedVideo) formData.append("video_url", selectedVideo)
      formData.append("youtube_url", youtubeUrl.trim())
      const response = await updateBanner(editingBanner._id, formData)
      if (response.success) {
        toast({ title: "Success", description: response.message || "Banner updated successfully" })
        setDialogs((prev) => ({ ...prev, editBanner: false }))
        setSelectedFile(null)
        setSelectedVideo(null)
        setYoutubeUrl("")
        setEditingBanner(null)
        fetchBanners()
      } else {
        toast({ title: "Error", description: response.error || "Failed to update banner" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update banner" })
    } finally {
      setLoading((prev) => ({ ...prev, action: false }))
    }
  }

  const handleDeleteBanner = async (bannerId: string) => {
    setLoading((prev) => ({ ...prev, action: true }))
    try {
      const response = await deleteBanner(bannerId)
      if (response.success) {
        toast({ title: "Success", description: response.message || "Banner deleted successfully" })
        fetchBanners()
      } else {
        toast({ title: "Error", description: response.error || "Failed to delete banner" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete banner" })
    } finally {
      setLoading((prev) => ({ ...prev, action: false }))
    }
  }

  const openEditBannerDialog = (banner: Banner) => {
    setEditingBanner(banner)
    setSelectedFile(null)
    setSelectedVideo(null)
    setYoutubeUrl(banner.youtube_url || "")
    setDialogs((prev) => ({ ...prev, editBanner: true }))
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  return (
    <div className="space-y-4 bg-white px-2 sm:px-4 md:px-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Banner Management</h2>
        <Dialog open={dialogs.addBanner} onOpenChange={(open) => {
          setDialogs((prev) => ({ ...prev, addBanner: open }))
          if (open) {
            setSelectedFile(null)
            setSelectedVideo(null)
            setYoutubeUrl("")
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Banner</DialogTitle>
              <DialogDescription>Upload a new banner image for the home page</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="banner-file">Banner Image</Label>
                <Input id="banner-file" type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              </div>
              <div>
                <Label htmlFor="banner-video">Banner Video (optional)</Label>
                <Input id="banner-video" type="file" accept="video/*" onChange={(e) => setSelectedVideo(e.target.files?.[0] || null)} />
              </div>
              <div>
                <Label htmlFor="banner-youtube">YouTube URL (optional)</Label>
                <Input id="banner-youtube" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddBanner} disabled={loading.action || !selectedFile}>
                {loading.action && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Add Banner
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {loading.banners ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <Card key={banner._id}>
              <CardHeader className="pb-2">
                <div className="aspect-video relative overflow-hidden rounded-md">
                  <img src={getMediaUrl(banner.image_url)} alt="Banner" className="object-cover w-full h-full" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">ID: {banner._id.slice(-8)}</p>
                    {(banner.youtube_url || banner.video_url) && (
                      <p className="text-xs text-muted-foreground">
                        {banner.youtube_url ? "YouTube attached" : "Video attached"}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditBannerDialog(banner)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    {isAdmin ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Banner</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to delete this banner? This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteBanner(banner._id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <ContactAdminModal
                        title="Delete Banner Access Denied"
                        description="You don't have permission to delete banners. Please contact the administrator for assistance."
                      >
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </ContactAdminModal>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Edit Banner Dialog */}
      <Dialog open={dialogs.editBanner} onOpenChange={(open) => setDialogs((prev) => ({ ...prev, editBanner: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Banner</DialogTitle>
            <DialogDescription>Upload a new image to replace the current banner</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {editingBanner && (
              <div className="aspect-video relative overflow-hidden rounded-md">
                <img src={getMediaUrl(editingBanner.image_url)} alt="Current Banner" className="object-cover w-full h-full" />
              </div>
            )}
            <div>
              <Label htmlFor="edit-banner-file">New Banner Image</Label>
              <Input id="edit-banner-file" type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
            </div>
            <div>
              <Label htmlFor="edit-banner-video">Banner Video (optional)</Label>
              <Input id="edit-banner-video" type="file" accept="video/*" onChange={(e) => setSelectedVideo(e.target.files?.[0] || null)} />
              {editingBanner?.video_url && !selectedVideo && (
                <p className="text-xs text-muted-foreground mt-1">A video file is already attached.</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-banner-youtube">YouTube URL (optional)</Label>
              <Input id="edit-banner-youtube" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateBanner} disabled={loading.action || !editingBanner}>
              {loading.action && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Update Banner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 