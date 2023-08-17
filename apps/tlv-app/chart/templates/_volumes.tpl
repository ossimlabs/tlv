
{{/*
Templates for the volumeMounts section
*/}}

{{- define "tlv.volumeMounts.configmaps" -}}
{{- range $configmapName, $configmapDict := .Values.configmaps}}
- name: {{ $configmapName | quote }}
  mountPath: {{ $configmapDict.mountPath | quote }}
  {{- if $configmapDict.subPath }}
  subPath: {{ $configmapDict.subPath | quote }}
  {{- end }}
{{- end -}}
{{- end -}}

{{- define "tlv.volumeMounts.secrets" -}}
{{- range $secretName, $secretDict := .Values.secrets}}
- name: {{ $secretName | quote }}
  mountPath: {{ $secretDict.mountPath | quote }}
  {{- if $secretDict.subPath }}
  subPath: {{ $secretDict.subPath | quote }}
  {{- end }}
{{- end -}}
{{- end -}}

{{- define "tlv.volumeMounts.pvcs" -}}
{{- range $volumeName := .Values.volumeNames }}
{{- $volumeDict := index $.Values.global.volumes $volumeName }}
- name: {{ $volumeName }}
  mountPath: {{ $volumeDict.mountPath }}
  {{- if $volumeDict.subPath }}
  subPath: {{ $volumeDict.subPath | quote }}
  {{- end }}
{{- end -}}
{{- end -}}

{{- define "tlv.volumeMounts" -}}
{{- include "tlv.volumeMounts.configmaps" . -}}
{{- include "tlv.volumeMounts.secrets" . -}}
{{- include "tlv.volumeMounts.pvcs" . -}}
{{- if .Values.global.extraVolumeMounts }}
{{ toYaml .Values.global.extraVolumeMounts }}
{{- end }}
{{- if .Values.extraVolumeMounts }}
{{ toYaml .Values.extraVolumeMounts }}
{{- end }}
{{- end -}}




{{/*
Templates for the volumes section
 */}}

{{- define "tlv.volumes.configmaps" -}}
{{- range $configmapName, $configmapDict := .Values.configmaps}}
- name: {{ $configmapName | quote }}
  configMap:
    name: {{ $configmapName | quote }}
{{- end -}}
{{- end -}}

{{- define "tlv.volumes.secrets" -}}
{{- range $secretName, $secretDict := .Values.secrets}}
- name: {{ $secretName | quote }}
  secret:
    secretName: {{ $secretName | quote }}
{{- end -}}
{{- end -}}

{{- define "tlv.volumes.pvcs" -}}
{{- range $volumeName := .Values.volumeNames }}
{{- $volumeDict := index $.Values.global.volumes $volumeName }}
- name: {{ $volumeName }}
  persistentVolumeClaim:
    claimName: "{{ include "tlv.fullname" $ }}-{{ $volumeName }}-pvc"
{{- end -}}
{{- end -}}

{{- define "tlv.volumes" -}}
{{- include "tlv.volumes.configmaps" . -}}
{{- include "tlv.volumes.secrets" . -}}
{{- include "tlv.volumes.pvcs" . -}}
{{- if .Values.global.extraVolumes }}
{{ toYaml .Values.global.extraVolumes }}
{{- end }}
{{- if .Values.extraVolumes }}
{{ toYaml .Values.extraVolumes }}
{{- end }}
{{- end -}}
