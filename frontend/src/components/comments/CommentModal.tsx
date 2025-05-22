import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Typography,
    IconButton,
    Box,
    Button,
    Divider,
    Slide
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, { useEffect, useState, forwardRef } from "react";
import { fetchCommentsByTask, createComment, updateComment, deleteComment } from "@/lib/comments";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Check";
import { useAppSelector } from "@/hooks/redux";
import { RootState } from "@/redux/store";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import toast from "react-hot-toast";


const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface Props {
    open: boolean;
    onClose: () => void;
    task: any;
    onCommentsCountChange?: (newCount: number) => void;

}

export default function CommentsModal({ open, onClose, task }: Props) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editedText, setEditedText] = useState("");
    const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);

    const currentUser = useAppSelector((state: RootState) => state.auth.user);




    const baseUrl = "http://localhost:3001";

    const fetchComments = async () => {
        try {
            const data = await fetchCommentsByTask(task._id);
            setComments(data);
        } catch (error) {
            console.error("Error fetching comments", error);
        }
    };

    const handleSubmitComment = async () => {
        if (!newComment.trim()) return;
        try {
            await createComment(newComment, task._id);
            setNewComment("");
            fetchComments();
            toast.success("Comment posted successfully");
        } catch (error) {
            console.error("Error posting comment", error);
            toast.error("Error posting comment");
        }
    };

    useEffect(() => {
        if (open && task) fetchComments();
    }, [open, task]);




    const handleUpdateComment = async (id: string) => {
        try {
            await updateComment(id, editedText);
            setEditingCommentId(null);
            setEditedText("");
            fetchComments();
            toast.success("Comment updated successfully");
        } catch (error) {
            console.error("Error updating comment", error);
            toast.error("Error updating comment");
        }
    };

    const handleDeleteComment = async (id: string) => {
        try {
            await deleteComment(id);
            fetchComments();
            toast.success("Comment deleted successfully");
        } catch (error) {
            console.error("Error deleting comment", error);
            toast.error("Error deleting comment");
        }
    };


    return (
        <Dialog
            open={open}
            onClose={onClose}
            TransitionComponent={Transition}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    p: 2,
                    position: "relative",
                    overflowY: "auto",
                    maxHeight: "90vh",
                },
            }}
            BackdropProps={{
                sx: {
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                },
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>

                <DialogTitle
                    sx={{
                        fontWeight: "bold",
                        fontSize: "1.8rem",
                        textAlign: "center",
                        wordWrap: "break-word",
                        whiteSpace: "normal",
                        overflowWrap: "break-word",
                        width: "100%", 
                        pr: '40px', 
                    }}
                >
                    🎯 {task.title}
                </DialogTitle>



                <IconButton onClick={onClose} sx={{ position: "absolute", right: 16, top: 16 }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            <DialogContent dividers>
                <Box
                    mb={2}
                    px={2}
                    py={2}
                    sx={{
                        backgroundColor: "#f5f5f5",
                        borderRadius: 2,
                        boxShadow: 1,
                        textAlign: "center",
                    }}
                >
                    <Typography
                        variant="h5"
                        fontWeight="bold"
                        color="primary"
                        gutterBottom
                        sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}
                    >
                        📝 Task Description
                    </Typography>

                    <Typography variant="body1" color="text.secondary">
                        {task.description || "No description provided."}
                    </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box display="flex" flexDirection="column" gap={2}>
                    {comments.map((comment: any) => {
                        const imageUrl = comment.author?.image?.startsWith("http")
                            ? comment.author.image.replace(/\\/g, "/")
                            : `${baseUrl}/static/${comment.author.image}`.replace(/\\/g, "/");


                        const isEditing = editingCommentId === comment._id;
                        const isMenuOpen = menuOpenId === comment._id;
                        const isOwner = comment.author?._id === currentUser?.id;




                        return (
                     <Box
  key={comment._id}
  display="flex"
  flexWrap="wrap" // ✅ يسمح بلف العناصر إذا المساحة ضاقت
  gap={2}
  alignItems="flex-start"
  sx={{
    p: 1.5,
    border: "1px solid #ddd",
    borderRadius: 2,
    backgroundColor: "#f9f9f9",
    position: "relative",
    width: "100%", // ✅ ضمان ملء عرض الحاوية
    boxSizing: "border-box", // ✅ عدم الخروج بسبب padding
    overflowWrap: "break-word",
    wordBreak: "break-word", // ✅ تفادي كسر التنسيق عند كلمات طويلة
  }}
>

                               <Box
  component="img"
  src={imageUrl}
  alt="comment"
  sx={{
    width: 40,
    height: 40,
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
  }}
/>



                                <Box flex={1}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                        color="text.primary"
                                        sx={{ fontSize: "1rem", mb: 0.5 }}
                                    >
                                        {comment.author?.name}
                                    </Typography>

                                    {isEditing ? (
                                        <>
                                            <TextField
                                                fullWidth
                                                value={editedText}
                                                onChange={(e) => setEditedText(e.target.value)}
                                                size="small"
                                                multiline
                                            />
                                            <Box mt={1} display="flex" gap={1}>
                                                <IconButton
                                                    onClick={() => handleUpdateComment(comment._id)}
                                                    sx={{ color: "green" }}
                                                    aria-label="save"
                                                >
                                                    <SaveIcon />
                                                </IconButton>

                                                <IconButton
                                                    onClick={() => {
                                                        setEditingCommentId(null);
                                                        setEditedText("");
                                                    }}
                                                    sx={{ color: "#d32f2f" }}
                                                    aria-label="cancel"
                                                >
                                                    <CloseIcon />
                                                </IconButton>
                                            </Box>
                                        </>
                                    ) : (
                                        <Box flex={1} minWidth={0}>

                                            <Typography
                                                variant="body1"
                                                color="text.secondary"
                                                sx={{ mb: 0.5, lineHeight: 1.6 }}
                                            >
                                                {comment.text}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="gray"
                                                sx={{ fontSize: "0.75rem" }}
                                            >
                                                {new Date(comment.createdAt).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>



                                {isOwner && !isEditing && (
                                    <Box ml={1} position="relative">
                                        <IconButton
                                            onClick={() => setMenuOpenId(isMenuOpen ? null : comment._id)}
                                            sx={{ color: "#555" }}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>

                                        {isMenuOpen && (
                                        <Box
  ml="auto"
  position="relative"
  sx={{ flexShrink: 0 }} // ✅ منع التمدد الذي قد يفسد التنسيق
>
  <IconButton
    onClick={() => setMenuOpenId(isMenuOpen ? null : comment._id)}
    sx={{ color: "#555" }}
  >
    <MoreVertIcon />
  </IconButton>

  {isMenuOpen && (
    <Box
      sx={{
        position: "absolute",
        top: "100%",
        right: 0,
        backgroundColor: "white",
        boxShadow: 3,
        borderRadius: 1,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        minWidth: 100, // ✅ لتجنب الضيق الشديد على شاشات صغيرة
      }}
    >
      ...
    </Box>
  )}
</Box>

                                        )}
                                    </Box>
                                )}
                            </Box>
                        );
                    })}


                </Box>

                <Box mt={3}>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                    />
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSubmitComment}
                        sx={{ mt: 1 }}
                    >
                        Post Comment
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
