import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Form, Badge } from 'react-bootstrap';
import { 
  getCourseComments, 
  getLessonComments, 
  addComment, 
  addReply, 
  likeComment 
} from '../data/mockComments';
import { useAuth } from '../hooks/useAuth';
import '../styles/comments.css';

const StarRating = ({ rating, onRatingChange = null, readonly = true }) => {
  return (
    <div className="d-flex align-items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`bi bi-star${star <= rating ? '-fill' : ''} ${star <= rating ? 'text-warning' : 'text-muted'}`}
          onClick={() => !readonly && onRatingChange && onRatingChange(star)}
          style={{ cursor: !readonly ? 'pointer' : 'default', fontSize: '1.1em' }}
        />
      ))}
      <span className="ms-2 text-muted">({rating}/5)</span>
    </div>
  );
};

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
  onRatingChange: PropTypes.func,
  readonly: PropTypes.bool
};

const Comments = ({ courseId, lessonId = null }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [replyText, setReplyText] = useState({});
  const [showReplyForm, setShowReplyForm] = useState({});
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchedComments = lessonId 
      ? getLessonComments(courseId, lessonId) 
      : getCourseComments(courseId);
    setComments(fetchedComments);
  }, [courseId, lessonId]);

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    const comment = {
      courseId: parseInt(courseId),
      lessonId: lessonId ? parseInt(lessonId) : null,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
      comment: newComment,
      rating: lessonId ? null : newRating
    };

    const addedComment = addComment(comment);
    setComments([addedComment, ...comments]);
    setNewComment('');
    setNewRating(5);
  };

  const handleSubmitReply = (commentId) => {
    if (!user || !replyText[commentId]?.trim()) return;

    const reply = {
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
      comment: replyText[commentId]
    };

    addReply(commentId, reply);
    setComments([...comments]);
    setReplyText({ ...replyText, [commentId]: '' });
    setShowReplyForm({ ...showReplyForm, [commentId]: false });
  };

  const handleLike = (commentId) => {
    likeComment(commentId);
    setComments([...comments]);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="comments-section mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>
          {lessonId ? 'Lesson Comments' : 'Course Reviews'} 
          <Badge bg="primary" className="ms-2">{comments.length}</Badge>
        </h4>
      </div>

      {/* Add New Comment Form */}
      {user && (
        <Card className="mb-4">
          <Card.Body>
            <h6 className="card-title mb-3">
              {lessonId ? 'Add a Comment' : 'Write a Review'}
            </h6>
            <Form onSubmit={handleSubmitComment}>
              <div className="d-flex">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80'}
                  alt={user.name}
                  className="rounded-circle me-3"
                  style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                />
                <div className="flex-grow-1">
                  {!lessonId && (
                    <div className="mb-3">
                      <Form.Label>Rating</Form.Label>
                      <StarRating 
                        rating={newRating} 
                        onRatingChange={setNewRating}
                        readonly={false}
                      />
                    </div>
                  )}
                  <Form.Group className="mb-3">
                    <Form.Control
                      as="textarea"
                      rows="3"
                      placeholder={lessonId ? "Share your thoughts about this lesson..." : "Share your experience with this course..."}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <div className="d-flex justify-content-end">
                    <Button type="submit" variant="primary">
                      {lessonId ? 'Post Comment' : 'Submit Review'}
                    </Button>
                  </div>
                </div>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Comments List */}
      <div className="comments-list">
        {comments.map((comment) => (
          <Card key={comment.id} className="mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="d-flex align-items-center">
                  <img
                    src={comment.userAvatar}
                    alt={comment.userName}
                    className="rounded-circle me-3"
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                  />
                  <div>
                    <h6 className="mb-0">{comment.userName}</h6>
                    <small className="text-muted">{formatDate(comment.timestamp)}</small>
                  </div>
                </div>
                {comment.rating && (
                  <StarRating rating={comment.rating} />
                )}
              </div>
              
              <p className="mb-3">{comment.comment}</p>
              
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-3"
                    onClick={() => handleLike(comment.id)}
                  >
                    <i className="bi bi-hand-thumbs-up me-1"></i>
                    Like ({comment.likes})
                  </Button>
                  {user && (
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => setShowReplyForm({
                        ...showReplyForm,
                        [comment.id]: !showReplyForm[comment.id]
                      })}
                    >
                      <i className="bi bi-reply me-1"></i>
                      Reply
                    </Button>
                  )}
                </div>
              </div>

              {/* Reply Form */}
              {showReplyForm[comment.id] && user && (
                <div className="mt-3 ps-4">
                  <div className="d-flex">
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80'}
                      alt={user.name}
                      className="rounded-circle me-3"
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                    <div className="flex-grow-1">
                      <Form.Control
                        as="textarea"
                        rows="2"
                        className="mb-2"
                        placeholder="Write a reply..."
                        value={replyText[comment.id] || ''}
                        onChange={(e) => setReplyText({
                          ...replyText,
                          [comment.id]: e.target.value
                        })}
                      />
                      <div className="d-flex justify-content-end">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="me-2"
                          onClick={() => setShowReplyForm({
                            ...showReplyForm,
                            [comment.id]: false
                          })}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleSubmitReply(comment.id)}
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 ps-4 border-start border-2">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="d-flex mb-3">
                      <img
                        src={reply.userAvatar}
                        alt={reply.userName}
                        className="rounded-circle me-3"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <h6 className="mb-0 fs-6">{reply.userName}</h6>
                          <small className="text-muted">{formatDate(reply.timestamp)}</small>
                        </div>
                        <p className="mb-2">{reply.comment}</p>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleLike(reply.id)}
                        >
                          <i className="bi bi-hand-thumbs-up me-1"></i>
                          Like ({reply.likes})
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        ))}
        
        {comments.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-chat-dots display-3 text-muted mb-3"></i>
            <h5 className="text-muted">No comments yet</h5>
            <p className="text-muted">
              {lessonId ? 'Be the first to comment on this lesson!' : 'Be the first to review this course!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

Comments.propTypes = {
  courseId: PropTypes.string.isRequired,
  lessonId: PropTypes.string
};

export default Comments;