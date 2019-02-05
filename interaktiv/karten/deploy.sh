#!/bin/bash

# ########################################################
# Installation
# ########################################################
#
# This script only works for data.addendum.org because the invalidation
# key points to that domain.
# If you need it for other domains you need to update the distribution id
# and change the toplevel domain in the options
#
# 4 Easy steps to get this script to work.
#
# 1. install the awscli.
#    - https://docs.aws.amazon.com/cli/latest/userguide/installing.html
#
# 2. Configure your local awscli with your credentials
#    - https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html
#        - Follow the quick configuration guide.
#     - Fill in eu-west-1 as region, but here is the list of all the endpoints:
#        - https://docs.aws.amazon.com/general/latest/gr/rande.html
#
# 3. Fill in the options below.
#
# 4. Call script like ./deploy or bash deploy from the command line
#   4a. Add --delete as option to delete files from the remote
#       that are removed locally.
#
# ########################################################

# ########################################################
# Note
# ########################################################
#
# All high-level commands that involve uploading objects into
# an Amazon S3 bucket (aws s3 cp, aws s3 mv, and aws s3 sync)
# automatically perform a multipart upload when the object is large.
#
# Failed uploads cannot be resumed when using these commands.
# If the multipart upload fails due to a timeout or is manually
# cancelled by pressing CTRL+C, the AWS CLI cleans up any files
# created and aborts the upload. This process can take several minutes.
#
# If the process is interrupted by a kill command or system failure,
# the in-progress multipart upload remains in Amazon S3 and must be
# cleaned up manually in the AWS Management Console or with the s3api
# abort-multipart-upload command.
#
#
# Invalidations:
#   - The first 1000 invalidation requests/month are free.
#     After that they will be charged. Only the request to
#     invalidate is counted and not how many files are being
#     invalidated.
#
# ########################################################

# ########################################################
# Options
# ########################################################
#
# Fill in the local folder to sync.
# The script will upload only the contents and not the folder itself.
# The aws call is recursive but it will not create and upload empty folders.
LOCAL_FOLDER="dist"

# Fill in the path to the folder with starting / but no trailing /
# S3 will create the folder automatically if it does not exist.
#
# The final path will look like example: data.addendum.org/gfx/[REMOTE_FOLDER]
REMOTE_FOLDER="/gfx/2019-krebs/karten"

# Id for the cache invalidation call.
source ~/.aws/.cloudfrontid

# ########################################################
# The Black Box
# ########################################################

# Create final remote path.
FINAL_S3_PATH="s3://data.addendum.org"$REMOTE_FOLDER

# Colors for output message.
#
# Codes found here if you want to change it:
#     - https://gist.github.com/vratiu/9780109
#
GREEN="\033[0;32m"
PURPLE="\033[1;35m"
WHITE="\033[0;37m"

# Init options variable.
OPTIONS=""

# Parse command line arguments.
while [[ $# -gt 0 ]]
do
    key="$1"

    case $key in

        # Add the delete option.
        --delete)
            OPTIONS=$OPTIONS" --delete"
        ;;
    esac
    shift
done

# Call the aws sync command with paths and options.
echo -e $WHITE"Syncing "$LOCAL_FOLDER" to: "$FINAL_S3_PATH
aws s3 sync $LOCAL_FOLDER $FINAL_S3_PATH $OPTIONS --exclude "*DS_Store" --exclude ".git/*"
echo -e $GREEN"Syncing complete"

# We add a star to the path so it is recursive on all folders and files.
echo -e $WHITE"Invalidating cache for: "
aws cloudfront create-invalidation --distribution-id=$CLOUDFRONT_DISTRIBUTION_ID --paths $REMOTE_FOLDER"*"
echo -e $GREEN"Cache invalidation complete"
