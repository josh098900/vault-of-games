
-- Phase 1: Add missing critical RLS policies only where they don't exist

-- 1. Achievement notifications - critical missing policies
DROP POLICY IF EXISTS "Users can view achievement notifications for themselves" ON public.achievement_notifications;
DROP POLICY IF EXISTS "System can create achievement notifications" ON public.achievement_notifications;

CREATE POLICY "Users can view achievement notifications for themselves"
  ON public.achievement_notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create achievement notifications"
  ON public.achievement_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 2. Challenge participants - missing critical INSERT policy
DROP POLICY IF EXISTS "Users can participate in challenges as themselves" ON public.challenge_participants;
DROP POLICY IF EXISTS "Users can view challenge participants" ON public.challenge_participants;
DROP POLICY IF EXISTS "Users can update their own challenge participation" ON public.challenge_participants;
DROP POLICY IF EXISTS "Users can leave challenges" ON public.challenge_participants;

CREATE POLICY "Users can participate in challenges as themselves"
  ON public.challenge_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view challenge participants"
  ON public.challenge_participants
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own challenge participation"
  ON public.challenge_participants
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can leave challenges"
  ON public.challenge_participants
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 3. Direct messages - critical missing policies
DROP POLICY IF EXISTS "Users can view their own messages" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can update their received messages" ON public.direct_messages;

CREATE POLICY "Users can view their own messages"
  ON public.direct_messages
  FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON public.direct_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their received messages"
  ON public.direct_messages
  FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid());

-- 4. Event interests - missing critical policies
DROP POLICY IF EXISTS "Users can mark interest in events as themselves" ON public.event_interests;
DROP POLICY IF EXISTS "Users can view event interests" ON public.event_interests;
DROP POLICY IF EXISTS "Users can remove their event interests" ON public.event_interests;

CREATE POLICY "Users can mark interest in events as themselves"
  ON public.event_interests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view event interests"
  ON public.event_interests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can remove their event interests"
  ON public.event_interests
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 5. Game recommendations - missing critical policies
DROP POLICY IF EXISTS "Users can send game recommendations as themselves" ON public.game_recommendations;
DROP POLICY IF EXISTS "Users can view their own recommendations" ON public.game_recommendations;
DROP POLICY IF EXISTS "Recipients can update recommendation read status" ON public.game_recommendations;

CREATE POLICY "Users can send game recommendations as themselves"
  ON public.game_recommendations
  FOR INSERT
  TO authenticated
  WITH CHECK (recommender_id = auth.uid());

CREATE POLICY "Users can view their own recommendations"
  ON public.game_recommendations
  FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid() OR recommender_id = auth.uid());

CREATE POLICY "Recipients can update recommendation read status"
  ON public.game_recommendations
  FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid());

-- 6. Group message reactions - missing critical policies
DROP POLICY IF EXISTS "Users can view message reactions" ON public.group_message_reactions;
DROP POLICY IF EXISTS "Users can add reactions as themselves" ON public.group_message_reactions;
DROP POLICY IF EXISTS "Users can remove their own reactions" ON public.group_message_reactions;

CREATE POLICY "Users can view message reactions"
  ON public.group_message_reactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add reactions as themselves"
  ON public.group_message_reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their own reactions"
  ON public.group_message_reactions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 7. Group messages - missing critical policies
DROP POLICY IF EXISTS "Users can view group messages they have access to" ON public.group_messages;
DROP POLICY IF EXISTS "Users can send group messages as themselves" ON public.group_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.group_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.group_messages;

CREATE POLICY "Users can view group messages they have access to"
  ON public.group_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_conversation_members gcm
      WHERE gcm.group_id = group_messages.group_id AND gcm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send group messages as themselves"
  ON public.group_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.group_conversation_members gcm
      WHERE gcm.group_id = group_messages.group_id AND gcm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.group_messages
  FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
  ON public.group_messages
  FOR DELETE
  TO authenticated
  USING (sender_id = auth.uid());

-- 8. Live session messages - missing critical policies
DROP POLICY IF EXISTS "Users can view live session messages" ON public.live_session_messages;
DROP POLICY IF EXISTS "Users can send live session messages as themselves" ON public.live_session_messages;

CREATE POLICY "Users can view live session messages"
  ON public.live_session_messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can send live session messages as themselves"
  ON public.live_session_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 9. Message reactions - missing critical policies
DROP POLICY IF EXISTS "Users can view all message reactions" ON public.message_reactions;
DROP POLICY IF EXISTS "Users can add message reactions as themselves" ON public.message_reactions;
DROP POLICY IF EXISTS "Users can remove their own message reactions" ON public.message_reactions;

CREATE POLICY "Users can view all message reactions"
  ON public.message_reactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add message reactions as themselves"
  ON public.message_reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their own message reactions"
  ON public.message_reactions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 10. Notifications - missing critical policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- 11. User activities - missing critical policies
DROP POLICY IF EXISTS "Users can view activities from followed users" ON public.user_activities;
DROP POLICY IF EXISTS "Users can create their own activities" ON public.user_activities;

CREATE POLICY "Users can view activities from followed users"
  ON public.user_activities
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.user_follows 
      WHERE follower_id = auth.uid() AND following_id = user_activities.user_id
    )
  );

CREATE POLICY "Users can create their own activities"
  ON public.user_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 12. User follows - missing critical policies
DROP POLICY IF EXISTS "Users can view all follows" ON public.user_follows;
DROP POLICY IF EXISTS "Users can create follows" ON public.user_follows;
DROP POLICY IF EXISTS "Users can delete their own follows" ON public.user_follows;

CREATE POLICY "Users can view all follows"
  ON public.user_follows
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create follows"
  ON public.user_follows
  FOR INSERT
  TO authenticated
  WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can delete their own follows"
  ON public.user_follows
  FOR DELETE
  TO authenticated
  USING (follower_id = auth.uid());
