import { OpenPGPKey, OpenPGPSignature, DecryptResultPmcrypto } from 'pmcrypto';
import { Api, RequireSome, SimpleMap } from '@proton/shared/lib/interfaces';
import { Attachment, Message } from '@proton/shared/lib/interfaces/mail/Message';
import { VERIFICATION_STATUS } from '@proton/shared/lib/mail/constants';
import { EncryptionPreferences } from '@proton/shared/lib/mail/encryptionPreferences';
import { MESSAGE_ACTIONS } from '../../constants';
import { Preparation } from '../../helpers/transforms/transforms';
import { DecryptMessageResult } from '../../helpers/message/messageDecrypt';

export interface OutsideKey {
    type: 'outside';
    password: string;
    id: string;
    decryptedToken: string;
}

export interface PublicPrivateKey {
    type: 'publicPrivate';
    publicKeys: OpenPGPKey[];
    privateKeys: OpenPGPKey[];
}

export type MessageKeys = PublicPrivateKey | OutsideKey;

export interface MessageErrors {
    network?: Error[];
    decryption?: Error[];
    processing?: Error[];
    signature?: Error[];
    unknown?: Error[];
}

/**
 * Data structure containing all the needed informations about the signature verification of a message
 */
export interface MessageVerification {
    /**
     * Signatures verification status flag
     */
    verificationStatus: VERIFICATION_STATUS | undefined;

    /**
     * Signature verification errors, if any
     */
    verificationErrors: Error[] | undefined;

    /**
     * Pinned public keys of the sender which can verify, if any
     */
    senderPinnedKeys: OpenPGPKey[] | undefined;

    /**
     * Sender public keys retrieved from API which can are not pinned
     */
    senderPinnableKeys: OpenPGPKey[] | undefined;

    /**
     * If the sender is in the list of contacts, whether its contact signature has been verified
     */
    senderVerified: boolean | undefined;

    /**
     * If the message is signed, the public key that verifies the signature
     */
    signingPublicKey: OpenPGPKey | undefined;

    /**
     * Attached public key, if the message contains any
     */
    attachedPublicKeys: OpenPGPKey[] | undefined;
}

export interface AbstractMessageImage {
    type: 'remote' | 'embedded';
    original?: HTMLElement;
    url?: string;
    id: string;
    status: 'not-loaded' | 'loading' | 'loaded';
    tracker: string | undefined;
    error?: any;
}

export interface MessageRemoteImage extends AbstractMessageImage {
    type: 'remote';
    originalURL?: string;
}

export interface MessageEmbeddedImage extends AbstractMessageImage {
    type: 'embedded';
    cid: string;
    cloc: string;
    attachment: Attachment;
}

export type MessageImage = MessageRemoteImage | MessageEmbeddedImage;

export interface MessageImages {
    hasRemoteImages: boolean;
    hasEmbeddedImages: boolean;
    showRemoteImages: boolean;
    showEmbeddedImages: boolean;
    images: MessageImage[];
}

export interface MessageDecryption {
    /**
     * Decrypted message body content
     */
    decryptedBody?: string;

    /**
     * Decrypted raw content
     * Often the same as decryptedBody except for pgp-mime format, used for signature verification
     */
    decryptedRawContent?: Uint8Array;

    /**
     * Message signature obtained after decryption, if any
     * Warning, there could also be a signature in the mime content which is different
     */
    signature?: OpenPGPSignature;

    /**
     * Decrypted subject
     * Only used in rare situations where the message is sent by an external system which encrypt even the subject
     */
    decryptedSubject?: string;
}

export interface MessageDocument {
    /**
     * Document representing the message body
     * Processed to be rendered to the user
     */
    document?: Element;

    /**
     * Mail content when in plaintext mode
     */
    plainText?: string;

    /**
     * Initialization status of the message
     * undefined: not started
     * false: in progress
     * true: done
     */
    initialized?: boolean;

    /**
     * True if dark style injected in message content
     */
    hasDarkStyle?: boolean;

    /**
     * User choice to not apply dark style
     */
    noDarkStyle?: boolean;
}

export interface MessageDraftFlags {
    /**
     * Expiration offset in seconds from time of delivery
     */
    expiresIn?: number;

    /**
     * Original "To" address of the referring message. Only added for drafts.
     */
    originalTo?: string;

    /**
     * Original "AddressID" of the address of the referring message. Only added for drafts.
     * Used on rare situation when replying with a different address than the one you received the message.
     */
    originalAddressID?: string;

    /**
     * Action flags for draft messages
     */
    action?: MESSAGE_ACTIONS;

    /**
     * Action flags for draft messages
     */
    ParentID?: string;

    /**
     * Override auto save contacts preference
     */
    autoSaveContacts?: number;

    /**
     * true when sending message
     */
    sending?: boolean;

    /**
     * Attachments prepared during the creation of a draft to upload
     * when the draft will be created
     */
    initialAttachments?: File[];

    /**
     * Desired time for schedule send (timestamp)
     */
    scheduledAt?: number;

    /**
     * Flag meaning we are reopening the draft from an undo action
     */
    openDraftFromUndo?: boolean;

    /**
     * Flag for draft that has already been sent
     */
    isSentDraft?: boolean;
}

export interface MessageState {
    /**
     * ID used only on the frontend
     * Needed to keep a unique id on a message even if it's created in session without a server ID
     */
    localID: string;

    /**
     * Message object from the server
     */
    data?: Message;

    /**
     * All decryption data
     */
    decryption?: MessageDecryption;

    /**
     * Message document either html or plaintext
     */
    messageDocument?: MessageDocument;

    /**
     * Signature verifications results
     */
    verification?: MessageVerification;

    /**
     * All data relative to remote and embedded images present in the message
     */
    messageImages?: MessageImages;

    /**
     * Drafts specifics flags
     */
    draftFlags?: MessageDraftFlags;

    /**
     * Counter of load retry
     */
    loadRetry?: number;

    /**
     * All kind of errors that appears during message processing
     */
    errors?: MessageErrors;
}

export type MessagesState = SimpleMap<MessageState>;

/**
 * Common helper to have a MessageExtended with the data props required
 */
export type MessageStateWithData = RequireSome<MessageState, 'data'>;

/**
 * Common helper to have a partial MessageExtended including a Partial Message
 */
export type PartialMessageState = Partial<Omit<MessageState, 'data'> & { data: Partial<Message> }>;

export interface LoadParams {
    ID: string;
    api: Api;
}

export interface DocumentInitializeParams {
    ID: string;
    dataChanges: Partial<Message>;
    initialized?: boolean;
    preparation?: Preparation;
    decryption?: DecryptMessageResult;
    errors?: MessageErrors;
    messageImages?: MessageImages;
}

export interface VerificationParams {
    ID: string;
    encryptionPreferences?: EncryptionPreferences;
    verification?: {
        verified: VERIFICATION_STATUS;
        signature?: OpenPGPSignature;
        verificationErrors?: Error[];
    };
    signingPublicKey?: OpenPGPKey;
    attachedPublicKeys?: OpenPGPKey[];
    errors?: MessageErrors;
}

export interface LoadEmbeddedParams {
    ID: string;
    attachments: Attachment[];
    api: Api;
    messageVerification?: MessageVerification;
    messageKeys: MessageKeys;
    getAttachment: (ID: string) => DecryptResultPmcrypto | undefined;
    onUpdateAttachment: (ID: string, attachment: DecryptResultPmcrypto) => void;
}

export type LoadEmbeddedResults = { attachment: Attachment; blob: string }[];

export interface LoadRemoteParams {
    ID: string;
    imagesToLoad: MessageRemoteImage[];
    api: Api;
}

export interface LoadRemoteResults {
    image: MessageRemoteImage;
    blob?: Blob;
    tracker?: string;
    error?: unknown;
}
